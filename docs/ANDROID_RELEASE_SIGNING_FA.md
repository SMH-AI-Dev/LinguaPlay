# راهنمای ساخت کلید و انتشار امن APK — LinguaPlay

## ۱. ساخت کلید اختصاصی

این فرمان را در PowerShell ویندوز، در پوشه‌ای خارج از مخزن اجرا کنید:

```powershell
keytool -genkeypair -v -keystore linguaplay-release.jks -alias linguaplay -keyalg RSA -keysize 4096 -validity 10000
```

فایل JKS و رمزهای آن را در محل امن و پشتیبان رمزگذاری‌شده نگه دارید. گم‌شدن کلید می‌تواند انتشار به‌روزرسانی با همان امضای برنامه را ناممکن کند.

## ۲. تنظیم GitHub Actions Secrets

در مخزن LinguaPlay به مسیر **Settings → Secrets and variables → Actions → New repository secret** بروید و این چهار Secret را بسازید:

- `LINGUAPLAY_ANDROID_KEYSTORE_BASE64`: محتوای Base64 فایل JKS
- `LINGUAPLAY_ANDROID_STORE_PASSWORD`: رمز keystore
- `LINGUAPLAY_ANDROID_KEY_ALIAS`: مقدار `linguaplay`
- `LINGUAPLAY_ANDROID_KEY_PASSWORD`: رمز کلید

برای تبدیل فایل به Base64 در PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes(".\\linguaplay-release.jks")) | Set-Clipboard
```

مقدار Clipboard را در Secret اول قرار دهید. هیچ‌یک از رمزها یا فایل JKS را در کد، Issue، PR یا README قرار ندهید.

## ۳. انتشار

پس از ادغام تغییرات و تنظیم هر چهار Secret، تگ نسخه بسازید:

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions نسخه وب را Build می‌کند، پروژه Android را بسته‌بندی می‌کند، APK امضاشده را بررسی می‌کند و آن را در Release همان تگ قرار می‌دهد.

## ۴. بررسی اثر انگشت امضا

پس از دریافت APK می‌توان با Android SDK Build Tools اجرا کرد:

```bash
apksigner verify --verbose --print-certs app-release.apk
```

اثر انگشت گواهی را نگه دارید و در انتشارهای بعدی ثابت‌ماندن آن را بررسی کنید.
