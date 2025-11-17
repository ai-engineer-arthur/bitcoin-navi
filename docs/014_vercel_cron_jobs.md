# 014: Vercel Cron Jobs 設定

## 概要
Vercel Cron Jobs を使用して、定期的に価格をチェックしアラートを確認する自動処理を実装する。

## 技術スタック
- **Platform**: Vercel
- **Scheduling**: Vercel Cron Jobs (無料枠: Pro プランで必要)
- **Frequency**: 4 時間ごと

## TODO
- [ ] vercel.json 作成
- [ ] Cron Job エンドポイント作成
- [ ] セキュリティ対策（認証トークン）
- [ ] 環境変数設定
- [ ] デプロイ設定
- [ ] ログ確認
- [ ] エラー通知設定

## 実装詳細

### 1. vercel.json 設定
`vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/check-prices",
      "schedule": "0 */4 * * *"
    }
  ]
}
```

スケジュール説明:
- `0 */4 * * *`: 4 時間ごと (0:00, 4:00, 8:00, 12:00, 16:00, 20:00 UTC)
- 1 日 6 回実行

### 2. Cron エンドポイント
`src/app/api/cron/check-prices/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/get-db';
import { getAssetPrice } from '@/lib/api/prices';
import { checkAlerts } from '@/lib/alerts/check-alerts';

export async function GET(request: NextRequest) {
  // Security: Verify Vercel Cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Cron job started:', new Date().toISOString());

    const db = getDatabase();
    const assets = await db.getAssets();

    // Fetch prices for all assets
    const results = [];
    for (const asset of assets) {
      try {
        const priceData = await getAssetPrice(asset.symbol, asset.type);

        // Save to price history
        await db.addPriceHistory({
          asset_id: asset.id,
          price_usd: priceData.price_usd,
          price_jpy: priceData.price_jpy,
          volume: 0,
          timestamp: new Date().toISOString(),
        });

        results.push({
          symbol: asset.symbol,
          success: true,
          price: priceData.price_usd,
        });
      } catch (error) {
        console.error(`Failed to fetch ${asset.symbol}:`, error);
        results.push({
          symbol: asset.symbol,
          success: false,
          error: error.message,
        });
      }
    }

    // Check alerts
    await checkAlerts();

    console.log('Cron job completed:', results);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Required for Vercel Cron Jobs
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
```

### 3. 環境変数設定
`.env.local`:
```bash
CRON_SECRET=your-random-secret-key # openssl rand -base64 32
```

Vercel Dashboard で設定:
1. Project Settings → Environment Variables
2. `CRON_SECRET` を追加
3. Production, Preview, Development すべてにチェック

### 4. セキュリティヘッダー検証
Vercel Cron Jobs は自動的に `Authorization` ヘッダーを送信:
```
Authorization: Bearer <CRON_SECRET>
```

### 5. ローカルテスト用エンドポイント
`src/app/api/cron/test/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/get-db';
import { checkAlerts } from '@/lib/alerts/check-alerts';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    console.log('Test cron job started');

    // Same logic as the real cron job
    const db = getDatabase();
    const assets = await db.getAssets();
    await checkAlerts();

    return NextResponse.json({
      success: true,
      message: 'Test cron completed',
      assetsCount: assets.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### 6. ログ確認
Vercel Dashboard で確認:
1. Deployments → Functions タブ
2. `/api/cron/check-prices` の実行ログを確認
3. エラーがある場合は詳細を確認

### 7. エラー通知設定（オプション）
Cron ジョブが失敗した場合にメール通知:

`src/lib/email/send-error-notification.ts`:
```typescript
import { resend, FROM_EMAIL, TO_EMAIL } from './resend-client';

export async function sendErrorNotification(error: Error, context: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `🚨 Bitcoin Navi: Cron Job Error`,
      html: `
        <h2>Cron Job Error</h2>
        <p><strong>Context:</strong> ${context}</p>
        <p><strong>Error:</strong> ${error.message}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <pre>${error.stack}</pre>
      `,
    });
  } catch (emailError) {
    console.error('Failed to send error notification:', emailError);
  }
}
```

使用例:
```typescript
try {
  await checkAlerts();
} catch (error) {
  await sendErrorNotification(error, 'check-alerts');
  throw error;
}
```

### 8. レート制限考慮
API 制限を超えないように調整:

```typescript
// CoinGecko: 月 10,000 リクエスト
// 1日あたり: 10,000 / 30 = 約 333 リクエスト
// 4時間ごと（1日6回）: 333 / 6 = 約 55 リクエスト/回

// Alpha Vantage: 1日 25 リクエスト
// 4時間ごと（1日6回）: 25 / 6 = 約 4 リクエスト/回

// 結論: 銘柄数を制限するか、APIコール頻度を調整
```

### 9. デプロイ
```bash
# Vercel にデプロイ
vercel --prod

# Cron Jobs が自動的に設定される
```

### 10. 動作確認
1. Vercel Dashboard → Cron Jobs タブ
2. 次回実行予定時刻を確認
3. 手動でトリガー（テスト実行）
4. ログで結果を確認

## 完了条件
- [ ] vercel.json が正しく設定されている
- [ ] Cron エンドポイントが動作する
- [ ] セキュリティ対策が実装されている
- [ ] ログが正しく記録される
- [ ] エラーハンドリングが実装されている
- [ ] レート制限を考慮している

## 関連チケット
- 前: #013 アラート通知機能実装
- 次: #015 過去データ初期ロード機能
- 関連: #011 価格取得 API 実装
