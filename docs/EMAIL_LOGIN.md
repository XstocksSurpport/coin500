# Aegisai 邮箱验证码登录说明

## 工作原理

1. 用户输入邮箱 → 点击「获取验证码」
2. 服务端调用 **Resend** 向该邮箱发送 **6 位数字验证码**（10 分钟内有效）
3. 用户输入验证码 → 验证通过后写入登录 Cookie（30 天有效）
4. 刷新页面自动保持登录

## 一、配置 Resend（发信）

1. 注册 [resend.com](https://resend.com)
2. **API Keys** → 创建密钥 → 复制 `re_...`
3. 在部署平台或本地 `.env.local` 配置：

```env
RESEND_API_KEY=re_你的密钥
EMAIL_FROM=Aegisai <noreply@aegisai.sbs>
AUTH_SECRET=至少32位随机字符串
```

## 二、如何收到验证码邮件

### 测试阶段（未绑定自己的域名）

Resend 测试发件地址为 `onboarding@resend.dev`，**只能发送到你在 Resend 注册时使用的那个邮箱**。

- 登录网站时，请填写 **Resend 账号邮箱**
- 到收件箱（及垃圾邮件）查收标题为「Aegisai 登录验证码」的邮件

### 正式上线（任意用户邮箱都能收）

1. Resend → **Domains** → 添加你的域名（如 `aegisai.com`）
2. 按提示在 DNS 添加 SPF / DKIM 记录并验证
3. 修改环境变量：

```env
EMAIL_FROM=Aegisai <noreply@你的域名.com>
```

4. 重新部署后，任意用户邮箱均可收到验证码

## 三、部署环境变量清单

在 Vercel / Render 项目 **Environment Variables** 中设置：

| 变量 | 说明 |
|------|------|
| `RESEND_API_KEY` | Resend API 密钥 |
| `EMAIL_FROM` | 发件人，如 `Aegisai <noreply@aegisai.sbs>` |
| `AUTH_SECRET` | 会话签名密钥（随机长字符串） |
| `NEXT_PUBLIC_EVM_WALLET_ADDRESS` | EVM 充值地址 |
| `NEXT_PUBLIC_SOL_WALLET_ADDRESS` | Solana 充值地址 |

保存后 **Redeploy** 一次。

## 四、本地测试

```bash
cd coin500
# 确保 .env.local 已配置上述变量
npm run dev
```

打开 http://localhost:3001 → 登录 → 使用 Resend 注册邮箱收验证码。

## 五、常见问题

| 现象 | 处理 |
|------|------|
| 提示「邮件服务未配置」 | 检查 `RESEND_API_KEY` 是否已写入环境变量并重启/重新部署 |
| 收不到邮件 | 测试阶段必须用 Resend 注册邮箱；查垃圾箱 |
| 验证码错误/过期 | 10 分钟内有效，可点「重新发送」 |
| 正式环境用户收不到 | 需完成域名验证并更新 `EMAIL_FROM` |
