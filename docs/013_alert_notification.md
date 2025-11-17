# 013: アラート通知機能実装

## 概要
Resend を使用したメール通知機能を実装する。価格がアラート閾値に達した際に自動でメール送信する。

## 技術スタック
- **Email Service**: Resend (月 3,000 通無料枠)
- **Framework**: Next.js 15 API Routes

## TODO
- [ ] Resend アカウント作成
- [ ] API キー取得
- [ ] Resend SDK インストール
- [ ] 環境変数設定
- [ ] メールテンプレート作成
- [ ] アラートチェック機能実装
- [ ] メール送信機能実装
- [ ] 通知履歴保存

## 実装詳細

### 1. Resend セットアップ
1. https://resend.com/ でアカウント作成
2. API キーを取得
3. ドメイン検証（開発時は提供されるドメイン使用可）

### 2. パッケージインストール
```bash
npm install resend
```

### 3. 環境変数設定
`.env.local`:
```bash
RESEND_API_KEY=re_xxxxx
ALERT_EMAIL=your-email@example.com
```

### 4. Resend クライアント
`src/lib/email/resend-client.ts`:
```typescript
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = 'Bitcoin Navi <notifications@resend.dev>';
export const TO_EMAIL = process.env.ALERT_EMAIL!;
```

### 5. メールテンプレート
`src/lib/email/templates/alert-email.tsx`:
```typescript
interface AlertEmailProps {
  assetName: string;
  assetSymbol: string;
  alertType: 'high' | 'low';
  threshold: number;
  currentPrice: number;
  currency: string;
}

export function AlertEmail({
  assetName,
  assetSymbol,
  alertType,
  threshold,
  currentPrice,
  currency,
}: AlertEmailProps) {
  const emoji = alertType === 'high' ? '📈' : '📉';
  const action = alertType === 'high' ? 'exceeded' : 'dropped below';

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #22C55E; color: white; padding: 20px; text-align: center; }
    .content { background: #f4f4f4; padding: 20px; margin: 20px 0; }
    .price { font-size: 24px; font-weight: bold; color: #22C55E; }
    .button { background: #22C55E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${emoji} Price Alert Triggered</h1>
    </div>
    <div class="content">
      <h2>${assetName} (${assetSymbol})</h2>
      <p>The price has ${action} your alert threshold:</p>
      <p class="price">
        Current: ${currency === 'USD' ? '$' : '¥'}${currentPrice.toLocaleString()}<br>
        Threshold: ${currency === 'USD' ? '$' : '¥'}${threshold.toLocaleString()}
      </p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">
        View Dashboard
      </a>
    </div>
    <p style="text-align: center; color: #888; font-size: 12px;">
      Bitcoin Navi - Your Crypto & Stock Monitor
    </p>
  </div>
</body>
</html>
  `;
}
```

### 6. メール送信機能
`src/lib/email/send-alert-email.ts`:
```typescript
import { resend, FROM_EMAIL, TO_EMAIL } from './resend-client';
import { AlertEmail } from './templates/alert-email';

interface SendAlertEmailParams {
  assetName: string;
  assetSymbol: string;
  alertType: 'high' | 'low';
  threshold: number;
  currentPrice: number;
  currency: string;
}

export async function sendAlertEmail(params: SendAlertEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `🚨 ${params.assetSymbol} Alert: ${params.alertType === 'high' ? 'High' : 'Low'} Price Threshold Reached`,
      html: AlertEmail(params),
    });

    if (error) {
      console.error('Email send error:', error);
      throw error;
    }

    console.log('Alert email sent:', data);
    return data;
  } catch (error) {
    console.error('Failed to send alert email:', error);
    throw error;
  }
}
```

### 7. アラートチェック機能
`src/lib/alerts/check-alerts.ts`:
```typescript
import { getDatabase } from '@/lib/db/get-db';
import { getAssetPrice } from '@/lib/api/prices';
import { sendAlertEmail } from '@/lib/email/send-alert-email';

export async function checkAlerts() {
  const db = getDatabase();

  // Get all active alerts
  const alerts = await db.getAlerts();
  const activeAlerts = alerts.filter((a) => a.is_active && !a.is_triggered);

  console.log(`Checking ${activeAlerts.length} active alerts...`);

  for (const alert of activeAlerts) {
    try {
      // Get asset info
      const asset = await db.getAssetById(alert.asset_id);
      if (!asset) continue;

      // Get current price
      const priceData = await getAssetPrice(asset.symbol, asset.type);
      const currentPrice =
        alert.currency === 'USD' ? priceData.price_usd : priceData.price_jpy;

      // Check if alert should be triggered
      const shouldTrigger =
        (alert.type === 'high' && currentPrice >= alert.threshold) ||
        (alert.type === 'low' && currentPrice <= alert.threshold);

      if (shouldTrigger) {
        console.log(`Alert triggered for ${asset.symbol}: ${currentPrice}`);

        // Send email notification
        await sendAlertEmail({
          assetName: asset.name,
          assetSymbol: asset.symbol,
          alertType: alert.type,
          threshold: alert.threshold,
          currentPrice,
          currency: alert.currency,
        });

        // Mark alert as triggered
        await db.updateAlert(alert.id, {
          is_triggered: true,
          triggered_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error(`Failed to check alert ${alert.id}:`, error);
    }
  }
}
```

### 8. 手動トリガーAPI
`src/app/api/alerts/check/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { checkAlerts } from '@/lib/alerts/check-alerts';

export async function POST() {
  try {
    await checkAlerts();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Alert check error:', error);
    return NextResponse.json(
      { error: 'Failed to check alerts' },
      { status: 500 }
    );
  }
}

// Security: Require auth or API key
export const runtime = 'nodejs';
```

### 9. アラート管理 API
`src/app/api/alerts/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/get-db';

// Get all alerts
export async function GET() {
  try {
    const db = getDatabase();
    const alerts = await db.getAlerts();
    return NextResponse.json(alerts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

// Create new alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDatabase();

    const alert = await db.createAlert({
      asset_id: body.asset_id,
      type: body.type,
      threshold: body.threshold,
      currency: body.currency,
      is_active: true,
      is_triggered: false,
    });

    return NextResponse.json(alert);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}
```

### 10. アラートトグル API
`src/app/api/alerts/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/get-db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const db = getDatabase();

    const alert = await db.updateAlert(params.id, body);
    return NextResponse.json(alert);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDatabase();
    await db.deleteAlert(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    );
  }
}
```

## 完了条件
- [ ] Resend が正しく設定されている
- [ ] メールが送信される
- [ ] アラートチェックが動作する
- [ ] アラート管理 API が動作する
- [ ] 通知履歴が保存される
- [ ] エラーハンドリングが実装されている

## 関連チケット
- 前: #012 グラフ表示機能実装
- 次: #014 Vercel Cron Jobs 設定
- 関連: #007 アラート設定画面 UI
