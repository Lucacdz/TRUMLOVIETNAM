/* Token Switcher — Vendetta / Bunny / Revenge plugin (built) */
(function () {
  const vendetta = window.vendetta || {};
  const metro = vendetta.metro || {};
  const findByProps = metro.findByProps || (() => null);
  const findByStoreName = metro.findByStoreName || (() => null);
  const common = metro.common || {};
  const React = common.React;
  const ReactNative = common.ReactNative || {};
  const stylesheet = common.stylesheet;
  const toasts = (vendetta.ui && vendetta.ui.toasts) || {};
  const showToast = toasts.showToast || ((m) => console.log("[TokenSwitcher]", m));
  const storage = (vendetta.plugin && vendetta.plugin.storage) || {};

  const { View, Text, TextInput, TouchableOpacity, ScrollView, Clipboard } = ReactNative;

  function getAuthModule() {
    try {
      return (
        findByProps("getToken", "setToken") ||
        findByProps("getToken") ||
        (findByStoreName && findByStoreName("AuthenticationStore")) ||
        null
      );
    } catch (e) {
      return null;
    }
  }

  function getLoginModule() {
    try {
      return findByProps("loginToken") || findByProps("login", "logout") || null;
    } catch (e) {
      return null;
    }
  }

  function getCurrentToken() {
    try {
      const auth = getAuthModule();
      if (auth && typeof auth.getToken === "function") {
        const t = auth.getToken();
        if (t && typeof t === "string" && t.length > 20) return t;
      }
    } catch (e) {
      console.warn("[TokenSwitcher] getToken", e);
    }
    return null;
  }

  function loginWithToken(token) {
    token = String(token || "").trim().replace(/^["']|["']$/g, "");
    if (!token || token.length < 20) {
      showToast("Token không hợp lệ");
      return false;
    }
    try {
      const login = getLoginModule();
      if (login && typeof login.loginToken === "function") {
        login.loginToken(token);
        showToast("Đang đăng nhập…");
        return true;
      }
    } catch (e) {
      console.warn("[TokenSwitcher] loginToken", e);
    }
    try {
      const auth = getAuthModule();
      if (auth && typeof auth.setToken === "function") {
        auth.setToken(token);
        showToast("Đã set token — restart app nếu cần");
        return true;
      }
    } catch (e) {
      console.warn("[TokenSwitcher] setToken", e);
    }
    showToast("Không tìm thấy API login trên bản Discord này");
    return false;
  }

  function copyToken(token) {
    try {
      if (Clipboard && Clipboard.setString) {
        Clipboard.setString(token);
        showToast("Đã copy token");
        return;
      }
    } catch (_) {}
    showToast("Copy thất bại");
  }

  const styles =
    stylesheet && stylesheet.createThemedStyleSheet
      ? stylesheet.createThemedStyleSheet({
          wrap: { padding: 12 },
          title: { color: "WHITE", fontSize: 16, fontWeight: "700", marginBottom: 4 },
          hint: { color: "TEXT_MUTED", fontSize: 12, lineHeight: 17, marginBottom: 8 },
          input: {
            backgroundColor: "BACKGROUND_SECONDARY",
            color: "TEXT_NORMAL",
            borderRadius: 8,
            padding: 12,
            fontSize: 12,
            minHeight: 90,
            textAlignVertical: "top",
            marginBottom: 8,
          },
          row: { flexDirection: "row", marginBottom: 8 },
          btn: {
            flex: 1,
            backgroundColor: "BRAND",
            padding: 12,
            borderRadius: 8,
            alignItems: "center",
            marginHorizontal: 4,
          },
          btnGhost: { backgroundColor: "BACKGROUND_TERTIARY" },
          btnText: { color: "WHITE", fontWeight: "700", fontSize: 13 },
          warn: {
            marginTop: 8,
            padding: 10,
            borderRadius: 8,
            backgroundColor: "BACKGROUND_SECONDARY",
          },
          warnText: { color: "TEXT_WARNING", fontSize: 11, lineHeight: 16 },
        })
      : {
          wrap: { padding: 12 },
          title: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 4 },
          hint: { color: "#b5bac1", fontSize: 12, lineHeight: 17, marginBottom: 8 },
          input: {
            backgroundColor: "#1e1f22",
            color: "#fff",
            borderRadius: 8,
            padding: 12,
            fontSize: 12,
            minHeight: 90,
            textAlignVertical: "top",
            marginBottom: 8,
          },
          row: { flexDirection: "row", marginBottom: 8 },
          btn: {
            flex: 1,
            backgroundColor: "#5865F2",
            padding: 12,
            borderRadius: 8,
            alignItems: "center",
            marginHorizontal: 4,
          },
          btnGhost: { backgroundColor: "#2b2d31" },
          btnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
          warn: { marginTop: 8, padding: 10, borderRadius: 8, backgroundColor: "#1e1f22" },
          warnText: { color: "#f0b232", fontSize: 11, lineHeight: 16 },
        };

  function Settings() {
    const [token, setToken] = React.useState(storage.lastToken || "");

    React.useEffect(function () {
      const t = getCurrentToken();
      if (t) setToken(t);
    }, []);

    return React.createElement(
      ScrollView || View,
      { style: styles.wrap },
      React.createElement(Text, { style: styles.title }, "🔑 Token Switcher"),
      React.createElement(
        Text,
        { style: styles.hint },
        "Lấy token phiên hiện tại hoặc dán token của bạn rồi đăng nhập. Chỉ dùng token bạn sở hữu."
      ),
      React.createElement(TextInput, {
        style: styles.input,
        multiline: true,
        value: token,
        onChangeText: function (v) {
          setToken(v);
          storage.lastToken = v;
        },
        placeholder: "Token…",
        placeholderTextColor: "#6d6f78",
        autoCapitalize: "none",
        autoCorrect: false,
      }),
      React.createElement(
        View,
        { style: styles.row },
        React.createElement(
          TouchableOpacity,
          {
            style: [styles.btn, styles.btnGhost],
            onPress: function () {
              const t = getCurrentToken();
              if (t) {
                setToken(t);
                storage.lastToken = t;
                showToast("Đã lấy token");
              } else showToast("Không lấy được token");
            },
          },
          React.createElement(Text, { style: styles.btnText }, "📥 Lấy token")
        ),
        React.createElement(
          TouchableOpacity,
          {
            style: [styles.btn, styles.btnGhost],
            onPress: function () {
              if (!token) return showToast("Chưa có token");
              copyToken(token);
            },
          },
          React.createElement(Text, { style: styles.btnText }, "📋 Copy")
        )
      ),
      React.createElement(
        View,
        { style: styles.row },
        React.createElement(
          TouchableOpacity,
          {
            style: styles.btn,
            onPress: function () {
              loginWithToken(token);
            },
          },
          React.createElement(Text, { style: styles.btnText }, "🚪 Đăng nhập token")
        )
      ),
      React.createElement(
        View,
        { style: styles.warn },
        React.createElement(
          Text,
          { style: styles.warnText },
          "⚠ Token = mật khẩu. Chỉ dùng tài khoản của bạn. Có rủi ro vi phạm Discord ToS."
        )
      )
    );
  }

  module.exports = {
    onLoad: function () {
      console.log("[TokenSwitcher] loaded");
    },
    onUnload: function () {
      console.log("[TokenSwitcher] unloaded");
    },
    settings: Settings,
  };
})();
