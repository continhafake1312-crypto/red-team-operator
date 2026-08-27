#!/bin/bash
# WordPress-specific quick probes (curated)
BASE="http://teste.caveira.com"
OUT=/home/ubuntu/engagement/caveira.com/enum/teste_caveira_com
: > $OUT/wp_quick_probe.txt

probe() {
  local path="$1"
  code=$(proxychains4 -q curl -s -o /dev/null -w "%{http_code} %{size_download}" --max-time 20 "$BASE$path")
  echo "$code  $path" >> $OUT/wp_quick_probe.txt
}

# Common WP plugins (readme.txt confirms presence + version)
PLUGINS=(
  elementor elementor-pro hello-dolly akismet jetpack wordfence
  wordpress-seo yoast-seo rank-math wpforms wpforms-lite contact-form-7
  gravityforms formidable ninja-forms woocommerce woocommerce-subscriptions
  duplicator updraftplus backwpup all-in-one-wp-migration wpvivid-backup
  wp-file-manager file-manager wpcode code-snippets wp-reset
  all-in-one-wp-security-and-fireword better-wp-security ithemes-security
  sucuri-scanner wp-security-audit-log wp-activity-log
  wp-rocket w3-total-cache litespeed-cache wp-optimize autoptimize
  wp-dbmanager wp-phpmyadmin wp-phpmyadmin-extension adminer
  wp-staging wp-all-import wp-all-export wpml polylang sitepress-multilingual-cms
  wp-mail-smtp easy-wp-smtp wp-ses wp-discuz wpdiscuz
  wp-statistics real-statistics google-site-kit
  paid-memberships-pro memberpress restrict-content-pro wp-members members
  user-registration ultimate-member profile-builder theme-my-login
  wp-2fa two-factor defender-security miniorange-2-factor-authentication
  miniorange-wp-2fa miniorange-login-security miniorange-login
  miniorange-saml-2-factor-authentication miniorange-openid-connect
  miniorange-oauth-client miniorange-saml miniorange-sso
  miniorange-api-authentication miniorange-authentication
  buddypress bbpress learnpress tutor-lms lifterlms sensei-lms
  wp-cfm wp-clone wordpress-importer really-simple-ssl
  better-search-replace search-and-replace velvet-blues-update-urls
  wp-migrate-db wp-migrate-lite
  classic-editor classic-widgets disable-gutenberg
  cookie-notice complianz-gdpr cookie-law-info gdpr-cookie-consent
  redirection pretty-links simple-301-redirects
  smush ewww-image-optimizer shortpixel-image-optimizer
  imagify ewww-image-optimizer-autoptimize
  enable-media-replace regenerate-thumbnails
  wp-smushit wp-fastest-cache wp-super-cache
  really-simple-ssl really-simple-ssl-pro
  better-wp-security ithemes-security
  wp-fail2ban wp-limit-login-attempts limit-login-attempts-reloaded
  simple-history activity-log
  webhook-for-wp wp-webhooks
  adminer adminer-loader
  insert-headers-and-footers wp-headers-and-footers
  header-footer-code-manager
  custom-post-type-ui custom-post-types
  advanced-custom-fields acf-advanced-custom-fields
  pods-ckeditor-tags github-updater
  wp-rollback wordpress-rollback
  broken-link-checker
  better-wp-security-pro
  wpdefender defender-security
  malcare-security secupress
  solid-security-security
  wp-cerber wp-fail2ban
  wp-protect
  hide-my-wp hide-my-wp-plugin
  wps-hide-login
  recaptcha-for-woocommerce
  index-wp-mysql-for-speed
  wp-db-backup wp-database-backup
  backwpup-backup
  wpvivid-backup-mainwp
  mainwp mainwp-child
  wp-migrate-db-pro
  db-backup
  duplicator-pro
  wp-cron-manager
  wp-control
  debug-bar debug-bar-console query-monitor
  query-monitor
  wordpress-importer
  wp-downloader
  duplicate-post
  post-duplicator
  wp-cfm
  wp-all-export-pro
  wp-import-export-lite
  wp-import-export-pro
  wp-all-import-pro
)

# Dedupe and probe plugins
printf '%s\n' "${PLUGINS[@]}" | sort -u > /tmp/wp_plugins_list.txt
while read -r p; do
  probe "/wp-content/plugins/$p/readme.txt"
done < /tmp/wp_plugins_list.txt
# Direct plugin dir probing
while read -r p; do
  probe "/wp-content/plugins/$p/"
done < /tmp/wp_plugins_list.txt

# Standard WP paths
for p in \
  /wp-login.php /wp-admin/ /wp-admin/admin-ajax.php /wp-admin/install.php /wp-admin/upgrade.php \
  /wp-admin/maint/repair.php /wp-signup.php /wp-register.php /wp-mail.php /wp-cron.php \
  /wp-trackback.php /wp-pingback.php /xmlrpc.php /wp-comments-post.php \
  /wp-content/ /wp-content/uploads/ /wp-content/plugins/ /wp-content/themes/ /wp-content/upgrade/ \
  /wp-content/cache/ /wp-content/backups/ /wp-content/wflogs/ /wp-content/mu-plugins/ \
  /wp-content/debug.log /wp-content/error_log /wp-content/uploads/error_log \
  /wp-includes/ /wp-includes/version.php \
  /wp-config.php /wp-config.php.bak /wp-config.php.old /wp-config.php.txt /wp-config.php.save \
  /wp-config.php~ /wp-config.php.swp /wp-config-sample.php /wp-config.php.orig \
  /wp-config.zip /wp-config.bak /wp-config.old /wp-config.txt \
  /.git/HEAD /.git/config /.git/index /.gitignore /wp-content/.git/HEAD \
  /wp-content/.git/config /wp-content/.git/index \
  /wp-content/.htaccess /.htaccess /wp-content/uploads/.htaccess /wp-admin/.htaccess \
  /readme.html /license.txt \
  /wp-content/db.php /wp-content/object-cache.php /wp-content/advanced-cache.php \
  /wp-json/ /wp-json/wp/v2/ /wp-json/wp/v2/users /wp-json/wp/v2/users/1 \
  /wp-json/wp/v2/posts /wp-json/wp/v2/pages /wp-json/wp/v2/categories \
  /wp-json/wp/v2/media /wp-json/wp/v2/comments /wp-json/wp/v2/taxonomies \
  /wp-json/wp/v2/users?per_page=100 /wp-json/oembed/1.0/embed?url=http://teste.caveira.com/ \
  /?author=1 /?author=2 /?author=3 /?author=4 /?author=5 /?author=6 /?author=7 /?author=8 /?author=9 /?author=10 \
  /?p=1 /?p=2 /?p=3 /?page_id=2 /?page_id=3 \
  /wp-sitemap.xml /wp-sitemap-users-1.xml \
  /feed/ /comments/feed/ \
  /adminer.php /adminer/ /phpinfo.php /info.php /test.php /phpmyadmin/ /pma/ /phpMyAdmin/ \
  /backup/ /backups/ /db/ /database/ /sql/ /dump.sql /backup.sql /db.sql \
  /wp-content/uploads/duplicator/ /wp-content/uploads/dup-temp/ \
  /wp-content/uploads/backupbuddy/ /wp-content/uploads/backupbuddy_temp/ \
  /wp-content/uploads/elementor/ /wp-content/uploads/elementor/css/ \
  ; do
  probe "$p"
done

echo "DONE"
