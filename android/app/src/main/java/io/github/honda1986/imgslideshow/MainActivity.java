package io.github.honda1986.imgslideshow;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.ColorStateList;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.text.InputType;
import android.text.TextUtils;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.PopupMenu;
import android.widget.ProgressBar;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MainActivity extends Activity {

    /** スライドショー本体。起動のたびに GitHub から最新版を取りに行き、取れなければアプリに入っている版を使う。 */
    static final String SCRIPT_URL = "https://raw.githubusercontent.com/honda1986/img-slideshow/main/ss2.js";

    static final int BG = 0xFF0F1214, PANEL = 0xFF1B2228, FG = 0xFFE6EAED, MUTED = 0xFF8F9BA5,
            ACCENT = 0xFF3CC1CB, ACCENT_FG = 0xFF06161A, LINE = 0xFF263039;

    /** 広告枠の残りを隠す CSS（ページ読み込み後に入れる） */
    static final String HIDE_ADS_JS = "(function(){if(document.getElementById('__ssapp_hide'))return;"
            + "var s=document.createElement('style');s.id='__ssapp_hide';"
            + "s.textContent='ins.adsbygoogle,.adsbygoogle,[id^=\"div-gpt-ad\"],[id^=\"google_ads\"],"
            + "iframe[id^=\"google_ads_iframe\"],iframe[src*=\"doubleclick\"],iframe[src*=\"googlesyndication\"]"
            + "{display:none!important}';"
            + "(document.head||document.documentElement).appendChild(s);})();";

    LinearLayout root, toolbar, siteList;
    EditText urlField;
    ProgressBar progress;
    ScrollView homeView;
    WebView web;
    SharedPreferences prefs;
    AdBlocker ads;
    final AtomicInteger blocked = new AtomicInteger();
    boolean homeShown = true, immersive = false;

    // ---------- lifecycle ----------

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prefs = getSharedPreferences("app", MODE_PRIVATE);
        ads = new AdBlocker(this);
        if (Build.VERSION.SDK_INT >= 28) {
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(lp);
        }
        buildUi();
        setupWeb();
        setupBack();
        refreshScript();
        if (!handleIntent(getIntent())) showHome();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent(intent);
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    @Override
    protected void onPause() {
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        web.destroy();
        super.onDestroy();
    }

    // ---------- UI ----------

    int dp(float v) {
        return Math.round(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics()));
    }

    GradientDrawable round(int color, float radius) {
        GradientDrawable g = new GradientDrawable();
        g.setColor(color);
        g.setCornerRadius(dp(radius));
        return g;
    }

    TextView text(String s, float size, int color, boolean bold) {
        TextView t = new TextView(this);
        t.setText(s);
        t.setTextSize(size);
        t.setTextColor(color);
        if (bold) t.setTypeface(Typeface.DEFAULT_BOLD);
        return t;
    }

    TextView iconButton(String s, float size, String label) {
        TextView t = text(s, size, FG, false);
        t.setGravity(Gravity.CENTER);
        t.setLayoutParams(new LinearLayout.LayoutParams(dp(40), dp(40)));
        t.setContentDescription(label);
        TypedValue tv = new TypedValue();
        getTheme().resolveAttribute(android.R.attr.selectableItemBackgroundBorderless, tv, true);
        t.setBackgroundResource(tv.resourceId);
        t.setClickable(true);
        return t;
    }

    void buildUi() {
        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(BG);
        root.setFitsSystemWindows(true);

        toolbar = new LinearLayout(this);
        toolbar.setOrientation(LinearLayout.HORIZONTAL);
        toolbar.setGravity(Gravity.CENTER_VERTICAL);
        toolbar.setPadding(dp(4), dp(6), dp(4), dp(6));
        toolbar.setBackgroundColor(BG);

        TextView back = iconButton("‹", 28, "戻る");
        back.setOnClickListener(v -> toolbarBack());

        urlField = new EditText(this);
        LinearLayout.LayoutParams ulp = new LinearLayout.LayoutParams(0, dp(40), 1f);
        ulp.setMargins(dp(2), 0, dp(6), 0);
        urlField.setLayoutParams(ulp);
        urlField.setSingleLine(true);
        urlField.setTextSize(15);
        urlField.setTextColor(FG);
        urlField.setHintTextColor(MUTED);
        urlField.setHint("URL か検索語");
        urlField.setPadding(dp(14), 0, dp(14), 0);
        urlField.setBackground(round(PANEL, 20));
        urlField.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_URI);
        urlField.setImeOptions(EditorInfo.IME_ACTION_GO);
        urlField.setSelectAllOnFocus(true);
        urlField.setOnEditorActionListener((v, id, ev) -> {
            boolean enter = ev != null && ev.getKeyCode() == KeyEvent.KEYCODE_ENTER && ev.getAction() == KeyEvent.ACTION_DOWN;
            if (id == EditorInfo.IME_ACTION_GO || enter) {
                go(urlField.getText().toString());
                return true;
            }
            return false;
        });

        TextView slide = text("▶ スライド", 14, ACCENT_FG, true);
        slide.setGravity(Gravity.CENTER);
        slide.setPadding(dp(14), 0, dp(14), 0);
        slide.setBackground(round(ACCENT, 20));
        slide.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, dp(40)));
        slide.setContentDescription("スライドショーを始める");
        slide.setOnClickListener(v -> startSlideshow());

        TextView menu = iconButton("⋮", 22, "メニュー");
        menu.setOnClickListener(this::showMenu);

        toolbar.addView(back);
        toolbar.addView(urlField);
        toolbar.addView(slide);
        toolbar.addView(menu);

        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setMax(100);
        progress.setIndeterminate(false);
        progress.setProgressTintList(ColorStateList.valueOf(ACCENT));
        progress.setProgressBackgroundTintList(ColorStateList.valueOf(BG));
        progress.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(3)));
        progress.setVisibility(View.INVISIBLE);

        FrameLayout content = new FrameLayout(this);
        content.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));
        web = new WebView(this);
        web.setBackgroundColor(Color.WHITE);
        homeView = buildHome();
        content.addView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        content.addView(homeView, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        root.addView(toolbar);
        root.addView(progress);
        root.addView(content);
        setContentView(root);
    }

    ScrollView buildHome() {
        ScrollView sv = new ScrollView(this);
        sv.setBackgroundColor(BG);
        sv.setFillViewport(true);
        LinearLayout col = new LinearLayout(this);
        col.setOrientation(LinearLayout.VERTICAL);
        col.setPadding(dp(16), dp(20), dp(16), dp(32));

        TextView title = text("スライドショー", 24, FG, true);
        TextView sub = text("サイトを開いて「▶ スライド」を押すと、サムネイルの先にある大きい画像を集めて全画面で再生します。Chrome の「共有」からこのアプリを選んでも開けます。", 14, MUTED, false);
        sub.setPadding(0, dp(6), 0, dp(24));
        sub.setLineSpacing(0, 1.25f);
        TextView h = text("よく見るサイト", 12, MUTED, true);
        h.setLetterSpacing(0.08f);
        h.setPadding(0, 0, 0, dp(8));
        siteList = new LinearLayout(this);
        siteList.setOrientation(LinearLayout.VERTICAL);

        col.addView(title);
        col.addView(sub);
        col.addView(h);
        col.addView(siteList);
        sv.addView(col);
        return sv;
    }

    void renderSites() {
        siteList.removeAllViews();
        JSONArray a = loadSites();
        if (a.length() == 0) {
            TextView e = text("まだありません。見たいサイトを開いて、右上の ⋮ から「ホームに追加」を選ぶと、ここに並びます。", 14, MUTED, false);
            e.setLineSpacing(0, 1.25f);
            e.setPadding(dp(14), dp(14), dp(14), dp(14));
            GradientDrawable g = round(BG, 10);
            g.setStroke(dp(1), LINE);
            e.setBackground(g);
            siteList.addView(e);
            return;
        }
        for (int i = 0; i < a.length(); i++) {
            JSONObject o = a.optJSONObject(i);
            if (o == null) continue;
            final String u = o.optString("u");
            final String t = TextUtils.isEmpty(o.optString("t")) ? host(u) : o.optString("t");
            final int idx = i;
            LinearLayout row = new LinearLayout(this);
            row.setOrientation(LinearLayout.VERTICAL);
            row.setPadding(dp(14), dp(12), dp(14), dp(12));
            row.setBackground(round(PANEL, 10));
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
            lp.setMargins(0, 0, 0, dp(8));
            row.setLayoutParams(lp);
            TextView tt = text(t, 15, FG, true);
            tt.setSingleLine(true);
            tt.setEllipsize(TextUtils.TruncateAt.END);
            TextView hu = text(host(u), 12, MUTED, false);
            hu.setSingleLine(true);
            row.addView(tt);
            row.addView(hu);
            row.setOnClickListener(v -> openUrl(u));
            row.setOnLongClickListener(v -> {
                new AlertDialog.Builder(this)
                        .setTitle(t)
                        .setItems(new String[]{"開く", "ホームから外す"}, (d, which) -> {
                            if (which == 0) openUrl(u);
                            else removeSite(idx);
                        })
                        .show();
                return true;
            });
            siteList.addView(row);
        }
        TextView hint = text("長押しでホームから外せます", 12, MUTED, false);
        hint.setPadding(dp(4), dp(2), 0, 0);
        siteList.addView(hint);
    }

    void showMenu(View anchor) {
        PopupMenu pm = new PopupMenu(this, anchor);
        Menu m = pm.getMenu();
        boolean page = !homeShown;
        m.add(0, 1, 0, "ホーム");
        m.add(0, 2, 0, "進む").setEnabled(page && web.canGoForward());
        m.add(0, 3, 0, "再読み込み").setEnabled(page);
        m.add(0, 4, 0, "ホームに追加").setEnabled(page);
        m.add(0, 5, 0, "広告ブロック：" + (adOn() ? "オン" : "オフ") + (adOn() && page ? "（このページ " + blocked.get() + " 件）" : ""));
        m.add(0, 6, 0, "Chrome で開く").setEnabled(page);
        m.add(0, 7, 0, "ページを共有").setEnabled(page);
        m.add(0, 8, 0, "バージョン " + versionName()).setEnabled(false);
        pm.setOnMenuItemClickListener(item -> {
            switch (item.getItemId()) {
                case 1: showHome(); break;
                case 2: web.goForward(); break;
                case 3: web.reload(); break;
                case 4: addSite(); break;
                case 5:
                    prefs.edit().putBoolean("adblock", !adOn()).apply();
                    toast("広告ブロックを" + (adOn() ? "オン" : "オフ") + "にしました");
                    if (!homeShown) web.reload();
                    break;
                case 6: openInChrome(web.getUrl()); break;
                case 7: share(web.getUrl()); break;
            }
            return true;
        });
        pm.show();
    }

    // ---------- web ----------

    void setupWeb() {
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);
        s.setSupportMultipleWindows(false);
        s.setJavaScriptCanOpenWindowsAutomatically(false);
        s.setMediaPlaybackRequiresUserGesture(true);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, false);
        web.addJavascriptInterface(new Bridge(), "SSApp");
        web.setDownloadListener((url, ua, cd, mime, len) -> openExternal(url));

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                String sc = u.getScheme() == null ? "" : u.getScheme().toLowerCase();
                if (sc.equals("http") || sc.equals("https")) {
                    if (adOn() && r.isForMainFrame() && ads.isBlocked(u.getHost())) {
                        toast("広告のページを止めました");
                        return true;
                    }
                    return false;
                }
                if (sc.equals("about") || sc.equals("data") || sc.equals("blob") || sc.equals("javascript")) return false;
                openOtherScheme(v, u);
                return true;
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
                if (adOn()) {
                    String h = r.getUrl().getHost();
                    if (h != null && ads.isBlocked(h)) {
                        blocked.incrementAndGet();
                        return new WebResourceResponse("text/plain", "utf-8", new ByteArrayInputStream(new byte[0]));
                    }
                }
                return null;
            }

            @Override
            public void onPageStarted(WebView v, String url, Bitmap favicon) {
                blocked.set(0);
                if (immersive) setImmersive(false);
                if (!homeShown) setUrlText(url);
            }

            @Override
            public void onPageFinished(WebView v, String url) {
                if (!homeShown) setUrlText(url);
                if (adOn()) v.evaluateJavascript(HIDE_ADS_JS, null);
            }

            @Override
            public void doUpdateVisitedHistory(WebView v, String url, boolean isReload) {
                if (!homeShown) setUrlText(url);
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView v, int p) {
                progress.setProgress(p);
                progress.setVisibility(p < 100 && !homeShown && !immersive ? View.VISIBLE : View.INVISIBLE);
            }
        });
    }

    /** ページ内のスクリプトから呼ばれる。スライドショーの開閉に合わせて全画面にする。 */
    class Bridge {
        @JavascriptInterface
        public void immersive(boolean on) {
            runOnUiThread(() -> setImmersive(on));
        }
    }

    void setImmersive(boolean on) {
        immersive = on;
        toolbar.setVisibility(on ? View.GONE : View.VISIBLE);
        progress.setVisibility(View.INVISIBLE);
        if (on) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController c = getWindow().getInsetsController();
            if (c != null) {
                if (on) {
                    c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                    c.hide(WindowInsets.Type.systemBars());
                } else {
                    c.show(WindowInsets.Type.systemBars());
                }
            }
        } else {
            View d = getWindow().getDecorView();
            d.setSystemUiVisibility(on ? (View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE) : 0);
        }
    }

    void startSlideshow() {
        if (homeShown) {
            toast("先にサイトを開いてください");
            return;
        }
        String js = readScript();
        if (js == null) {
            toast("スライドショーを読み込めませんでした");
            return;
        }
        web.evaluateJavascript(js, null);
    }

    String readScript() {
        File f = new File(getFilesDir(), "ss2.js");
        try {
            if (f.exists() && f.length() > 1000) return readAll(new FileInputStream(f));
        } catch (IOException ignored) {
        }
        try {
            return readAll(getAssets().open("ss2.js"));
        } catch (IOException e) {
            return null;
        }
    }

    void refreshScript() {
        new Thread(() -> {
            HttpURLConnection c = null;
            try {
                c = (HttpURLConnection) new URL(SCRIPT_URL).openConnection();
                c.setConnectTimeout(8000);
                c.setReadTimeout(15000);
                c.setUseCaches(false);
                if (c.getResponseCode() == 200) {
                    String s = readAll(c.getInputStream());
                    if (s.contains("function SS2")) {
                        File tmp = new File(getFilesDir(), "ss2.js.tmp");
                        try (FileOutputStream o = new FileOutputStream(tmp)) {
                            o.write(s.getBytes(StandardCharsets.UTF_8));
                        }
                        //noinspection ResultOfMethodCallIgnored
                        tmp.renameTo(new File(getFilesDir(), "ss2.js"));
                    }
                }
            } catch (Exception ignored) {
            } finally {
                if (c != null) c.disconnect();
            }
        }).start();
    }

    static String readAll(InputStream in) throws IOException {
        try (InputStream is = in; ByteArrayOutputStream bo = new ByteArrayOutputStream()) {
            byte[] buf = new byte[16384];
            int n;
            while ((n = is.read(buf)) > 0) bo.write(buf, 0, n);
            return bo.toString("UTF-8");
        }
    }

    // ---------- navigation ----------

    void go(String q) {
        q = q.trim();
        if (q.isEmpty()) return;
        String u;
        if (q.matches("(?i)^https?://.*")) u = q;
        else if (!q.contains(" ") && q.contains(".")) u = "https://" + q;
        else u = "https://www.google.com/search?q=" + Uri.encode(q);
        hideKeyboard();
        openUrl(u);
    }

    void openUrl(String u) {
        homeShown = false;
        homeView.setVisibility(View.GONE);
        web.setVisibility(View.VISIBLE);
        setUrlText(u);
        web.loadUrl(u);
    }

    void showHome() {
        homeShown = true;
        if (immersive) setImmersive(false);
        web.stopLoading();
        renderSites();
        homeView.setVisibility(View.VISIBLE);
        web.setVisibility(View.INVISIBLE);
        progress.setVisibility(View.INVISIBLE);
        urlField.setText("");
        urlField.clearFocus();
    }

    void setUrlText(String u) {
        if (u != null && !urlField.hasFocus()) urlField.setText(u);
    }

    void toolbarBack() {
        if (homeShown) return;
        if (web.canGoBack()) web.goBack();
        else showHome();
    }

    void handleBack() {
        if (homeShown) {
            finish();
            return;
        }
        if (web.canGoBack()) web.goBack();
        else showHome();
    }

    void setupBack() {
        if (Build.VERSION.SDK_INT >= 33) {
            OnBackInvokedCallback cb = this::handleBack;
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT, cb);
        }
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        handleBack();
    }

    boolean handleIntent(Intent i) {
        if (i == null) return false;
        String a = i.getAction();
        String u = null;
        if (Intent.ACTION_SEND.equals(a)) {
            String t = i.getStringExtra(Intent.EXTRA_TEXT);
            if (t != null) {
                Matcher m = Pattern.compile("https?://\\S+").matcher(t);
                if (m.find()) u = m.group();
            }
            if (u == null) toast("共有された内容に URL が見つかりませんでした");
        } else if (Intent.ACTION_VIEW.equals(a) && i.getData() != null) {
            u = i.getData().toString();
        }
        if (u != null) {
            openUrl(u);
            return true;
        }
        return false;
    }

    void openOtherScheme(WebView v, Uri u) {
        try {
            Intent it;
            if ("intent".equalsIgnoreCase(u.getScheme())) {
                it = Intent.parseUri(u.toString(), Intent.URI_INTENT_SCHEME);
                it.addCategory(Intent.CATEGORY_BROWSABLE);
                it.setComponent(null);
                it.setSelector(null);
                try {
                    startActivity(it);
                } catch (ActivityNotFoundException e) {
                    String fb = it.getStringExtra("browser_fallback_url");
                    if (fb != null) v.loadUrl(fb);
                }
                return;
            }
            it = new Intent(Intent.ACTION_VIEW, u);
            startActivity(it);
        } catch (Exception ignored) {
        }
    }

    void openExternal(String url) {
        if (url == null) return;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
        } catch (Exception e) {
            toast("開けるアプリがありません");
        }
    }

    void openInChrome(String url) {
        if (url == null) return;
        Intent it = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        it.setPackage("com.android.chrome");
        try {
            startActivity(it);
        } catch (ActivityNotFoundException e) {
            it.setPackage(null);
            startActivity(Intent.createChooser(it, "ブラウザで開く"));
        }
    }

    void share(String url) {
        if (url == null) return;
        Intent it = new Intent(Intent.ACTION_SEND);
        it.setType("text/plain");
        it.putExtra(Intent.EXTRA_TEXT, url);
        startActivity(Intent.createChooser(it, "ページを共有"));
    }

    // ---------- saved sites ----------

    JSONArray loadSites() {
        try {
            return new JSONArray(prefs.getString("sites", "[]"));
        } catch (JSONException e) {
            return new JSONArray();
        }
    }

    void addSite() {
        String u = web.getUrl();
        if (u == null) return;
        String t = web.getTitle();
        JSONArray a = loadSites();
        for (int i = 0; i < a.length(); i++) {
            JSONObject o = a.optJSONObject(i);
            if (o != null && u.equals(o.optString("u"))) {
                toast("すでにホームにあります");
                return;
            }
        }
        try {
            JSONObject o = new JSONObject();
            o.put("u", u);
            o.put("t", t == null ? "" : t);
            a.put(o);
        } catch (JSONException ignored) {
        }
        prefs.edit().putString("sites", a.toString()).apply();
        toast("ホームに追加しました");
    }

    void removeSite(int idx) {
        JSONArray a = loadSites();
        if (idx >= 0 && idx < a.length()) a.remove(idx);
        prefs.edit().putString("sites", a.toString()).apply();
        renderSites();
    }

    // ---------- helpers ----------

    boolean adOn() {
        return prefs.getBoolean("adblock", true);
    }

    static String host(String u) {
        try {
            String h = Uri.parse(u).getHost();
            return h == null ? u : h;
        } catch (Exception e) {
            return u;
        }
    }

    String versionName() {
        try {
            return getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
        } catch (Exception e) {
            return "";
        }
    }

    void hideKeyboard() {
        InputMethodManager imm = (InputMethodManager) getSystemService(INPUT_METHOD_SERVICE);
        if (imm != null) imm.hideSoftInputFromWindow(urlField.getWindowToken(), 0);
        urlField.clearFocus();
    }

    void toast(String s) {
        Toast.makeText(this, s, Toast.LENGTH_SHORT).show();
    }
}
