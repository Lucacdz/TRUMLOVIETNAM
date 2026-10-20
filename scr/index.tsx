import { findByProps, findByStoreName } from "@vendetta/metro";
import { React, ReactNative, stylesheet } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { showToast } from "@vendetta/ui/toasts";
import { Forms, General } from "@vendetta/ui/components";

const { View, Text, TextInput, TouchableOpacity, ScrollView, Clipboard } = ReactNative as any;
const { FormSection, FormRow, FormDivider } = Forms;
const { Button } = General as any;

// ---- Token helpers (Discord mobile / Vendetta metro) ----
function getAuthModule() {
  return (
    findByProps("getToken", "setToken") ||
    findByProps("getToken") ||
    findByStoreName("AuthenticationStore") ||
    null
  );
}

function getLoginModule() {
  return (
    findByProps("loginToken") ||
    findByProps("login", "logout") ||
    null
  );
}

export function getCurrentToken(): string | null {
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

export function loginWithToken(token: string): boolean {
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
      showToast("Đã set token — restart app nếu chưa vào");
      return true;
    }
  } catch (e) {
    console.warn("[TokenSwitcher] setToken", e);
  }

  showToast("Không tìm thấy API login trên bản Discord này");
  return false;
}

export function copyToken(token: string) {
  try {
    if (Clipboard && Clipboard.setString) {
      Clipboard.setString(token);
      showToast("Đã copy token");
      return;
    }
  } catch (_) {}
  showToast("Copy thất bại");
}

// ---- Settings UI ----
const styles = stylesheet.createThemedStyleSheet({
  wrap: { padding: 12, gap: 10 },
  title: { color: "white", fontSize: 16, fontWeight: "700", marginBottom: 4 },
  hint: { color: "#b5bac1", fontSize: 12, lineHeight: 17, marginBottom: 8 },
  input: {
    backgroundColor: "#1e1f22",
    color: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 12,
    fontFamily: "monospace",
    minHeight: 90,
    textAlignVertical: "top",
  },
  row: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
  btn: {
    flex: 1,
    minWidth: 120,
    backgroundColor: "#5865F2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnGhost: { backgroundColor: "#2b2d31" },
  btnDanger: { backgroundColor: "#da373c" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  warn: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "rgba(240,178,50,0.15)",
  },
  warnText: { color: "#f0b232", fontSize: 11, lineHeight: 16 },
});

function Settings() {
  const [token, setToken] = React.useState((storage as any).lastToken || "");

  React.useEffect(() => {
    const t = getCurrentToken();
    if (t) setToken(t);
  }, []);

  return (
    <ScrollView style={styles.wrap}>
      <Text style={styles.title}>🔑 Token Switcher</Text>
      <Text style={styles.hint}>
        Lấy token phiên hiện tại hoặc dán token tài khoản của bạn rồi đăng nhập.
        Chỉ dùng token bạn sở hữu. Không chia sẻ token.
      </Text>

      <TextInput
        style={styles.input}
        multiline
        value={token}
        onChangeText={(v: string) => {
          setToken(v);
          (storage as any).lastToken = v;
        }}
        placeholder="Token…"
        placeholderTextColor="#6d6f78"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, styles.btnGhost]}
          onPress={() => {
            const t = getCurrentToken();
            if (t) {
              setToken(t);
              (storage as any).lastToken = t;
              showToast("Đã lấy token");
            } else showToast("Không lấy được token");
          }}
        >
          <Text style={styles.btnText}>📥 Lấy token</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnGhost]}
          onPress={() => {
            if (!token) return showToast("Chưa có token");
            copyToken(token);
          }}
        >
          <Text style={styles.btnText}>📋 Copy</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => loginWithToken(token)}
        >
          <Text style={styles.btnText}>🚪 Đăng nhập token</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.warn}>
        <Text style={styles.warnText}>
          ⚠ Token = mật khẩu đăng nhập. Self-bot / đổi token có thể vi phạm
          Discord ToS và dẫn tới ban. Chỉ dùng trên tài khoản của bạn.
        </Text>
      </View>
    </ScrollView>
  );
}

export default {
  onLoad: () => {
    console.log("[TokenSwitcher] loaded");
  },
  onUnload: () => {
    console.log("[TokenSwitcher] unloaded");
  },
  settings: Settings,
};
