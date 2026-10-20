(function (plugin, pluginApi, metro, patcher, common, components, storageApi, assets) {
  "use strict";

  var React = common.React;
  var ReactNative = common.ReactNative || {};
  var View = ReactNative.View;
  var Text = ReactNative.Text;
  var TextInput = ReactNative.TextInput;
  var TouchableOpacity = ReactNative.TouchableOpacity;
  var ScrollView = ReactNative.ScrollView;
  var Clipboard = ReactNative.Clipboard;

  var storage = pluginApi.storage || {};
  var showToast =
    (typeof vendetta !== "undefined" &&
      vendetta.ui &&
      vendetta.ui.toasts &&
      vendetta.ui.toasts.showToast) ||
    function (m) {
      console.log("[TokenSwitcher]", m);
    };

  function getAuthModule() {
    try {
      return (
        metro.findByProps("getToken", "setToken") ||
        metro.findByProps("getToken") ||
        (metro.findByStoreName && metro.findByStoreName("AuthenticationStore")) ||
        null
      );
    } catch (e) {
      return null;
    }
  }

  function getLoginModule() {
    try {
      return metro.findByProps("loginToken") || metro.findByProps("login", "logout") || null;
    } catch (e) {
      return null;
    }
  }

  function getCurrentToken() {
    try {
      var auth = getAuthModule();
      if (auth && typeof auth.getToken === "function") {
        var t = auth.getToken();
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
      showToast("Token khong hop le");
      return false;
    }
    try {
      var login = getLoginModule();
      if (login && typeof login.loginToken === "function") {
        login.loginToken(token);
        showToast("Dang dang nhap...");
        return true;
      }
    } catch (e) {
      console.warn("[TokenSwitcher] loginToken", e);
    }
    try {
      var auth = getAuthModule();
      if (auth && typeof auth.setToken === "function") {
        auth.setToken(token);
        showToast("Da set token — restart app neu can");
        return true;
      }
    } catch (e) {
      console.warn("[TokenSwitcher] setToken", e);
    }
    showToast("Khong tim thay API login");
    return false;
  }

  function copyToken(token) {
    try {
      if (Clipboard && Clipboard.setString) {
        Clipboard.setString(token);
        showToast("Da copy token");
        return;
      }
    } catch (e) {}
    showToast("Copy that bai");
  }

  var styles = {
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
    var _s = React.useState(storage.lastToken || "");
    var token = _s[0];
    var setToken = _s[1];

    React.useEffect(function () {
      var t = getCurrentToken();
      if (t) setToken(t);
    }, []);

    return React.createElement(
      ScrollView || View,
      { style: styles.wrap },
      React.createElement(Text, { style: styles.title }, "Token Switcher"),
      React.createElement(
        Text,
        { style: styles.hint },
        "Lay token phien hien tai hoac dan token cua ban roi dang nhap."
      ),
      React.createElement(TextInput, {
        style: styles.input,
        multiline: true,
        value: token,
        onChangeText: function (v) {
          setToken(v);
          storage.lastToken = v;
        },
        placeholder: "Token...",
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
              var t = getCurrentToken();
              if (t) {
                setToken(t);
                storage.lastToken = t;
                showToast("Da lay token");
              } else showToast("Khong lay duoc token");
            },
          },
          React.createElement(Text, { style: styles.btnText }, "Lay token")
        ),
        React.createElement(
          TouchableOpacity,
          {
            style: [styles.btn, styles.btnGhost],
            onPress: function () {
              if (!token) return showToast("Chua co token");
              copyToken(token);
            },
          },
          React.createElement(Text, { style: styles.btnText }, "Copy")
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
          React.createElement(Text, { style: styles.btnText }, "Dang nhap token")
        )
      ),
      React.createElement(
        View,
        { style: styles.warn },
        React.createElement(
          Text,
          { style: styles.warnText },
          "Token = mat khau. Chi dung tai khoan cua ban."
        )
      )
    );
  }

  plugin.onLoad = function () {
    console.log("[TokenSwitcher] loaded");
  };
  plugin.onUnload = function () {
    console.log("[TokenSwitcher] unloaded");
  };
  plugin.settings = Settings;
  return plugin;
})(
  {},
  vendetta.plugin,
  vendetta.metro,
  vendetta.patcher,
  vendetta.metro.common,
  vendetta.ui.components,
  vendetta.storage,
  vendetta.ui.assets
);
