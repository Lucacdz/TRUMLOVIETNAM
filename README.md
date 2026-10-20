# Token Switcher (Vendetta / Bunny / Revenge)

Plugin lấy token phiên hiện tại và đăng nhập bằng token trên Discord mobile mod.

## Cài đặt

1. Upload repo lên GitHub
2. Bật **GitHub Pages** (branch `gh-pages` hoặc folder `/docs`)
3. Trong Vendetta → Plugins → **+**
4. Dán URL dạng:

```
https://YOUR_USERNAME.github.io/YOUR_REPO/tokenSwitcher
```

Hoặc raw (một số loader hỗ trợ):

```
https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/dist/tokenSwitcher
```

## Build (máy tính)

Dùng template: https://github.com/vendetta-mod/plugin-template

1. Copy `src/` vào `plugins/tokenSwitcher/`
2. `pnpm i && pnpm build`
3. Output nằm trong `dist/tokenSwitcher/` (`manifest.json` + `index.js`)

## Bảo mật

- Chỉ dùng token **của bạn**
- Không gửi token cho người khác / website lạ
- Vi phạm Discord ToS có thể bị ban
