package io.github.honda1986.imgslideshow;

import android.content.Context;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Locale;
import java.util.regex.Pattern;

/** 広告配信サーバーへの通信を止める。リストは assets/adhosts.txt（1行に1ドメイン、サブドメインも対象）。 */
final class AdBlocker {
    private final HashSet<String> hosts = new HashSet<>();
    private static final Pattern PREFIX = Pattern.compile("^(ads?|adserver|adservice|adimg|banners?)\\d*\\.");

    AdBlocker(Context c) {
        try (BufferedReader r = new BufferedReader(new InputStreamReader(c.getAssets().open("adhosts.txt"), StandardCharsets.UTF_8))) {
            String line;
            while ((line = r.readLine()) != null) {
                line = line.trim().toLowerCase(Locale.ROOT);
                if (line.isEmpty() || line.startsWith("#")) continue;
                hosts.add(line);
            }
        } catch (IOException ignored) {
        }
    }

    boolean isBlocked(String host) {
        if (host == null || host.isEmpty()) return false;
        String h = host.toLowerCase(Locale.ROOT);
        if (PREFIX.matcher(h).find()) return true;
        while (true) {
            if (hosts.contains(h)) return true;
            int i = h.indexOf('.');
            if (i < 0) return false;
            h = h.substring(i + 1);
            if (h.indexOf('.') < 0) return false;
        }
    }
}
