# Automatic database backups
cat>./local-database-backup <<'NOW'
#!/bin/bash
cd /data/wordpress/
mkdir -p dev_db
cd dev_db
echo "*.sql" > .gitignore
echo "Exporting database..."
mysqldump -uvagrant -pvagrant -h127.0.0.1 --all-databases --single-transaction > $(date +%s).sql
#/usr/local/bin/wp-cli --path=/data/wordpress/htdocs/wordpress db export --single-transaction $(date +%s).sql --allow-root
echo ""
echo "Cleaning old databases (Over 7 days old)"
find ./ -mtime +7 -type f -delete
NOW

chmod +x ./local-database-backup

croncmd="/data/wordpress/local-database-backup"
cronjob="*/15 * * * * $croncmd"
( crontab -l | grep -v -F "$croncmd" ; echo "$cronjob" ) | crontab -

/data/wordpress/local-database-backup # run it for good measure

# Finally, edit the installation, if necessary
wp user get "redandblue.admin" > /dev/null &> /dev/null

if [ "$?" == "0" ]; then
  echo "Skipping setup, existing installation."
else
  PASSWORD=$(openssl rand -base64 32 | head -c32)
  echo "Your username is redandblue.admin"
  echo "Your password is $PASSWORD"

  wp user create "redandblue.admin" "dev@redandblue.fi" --role="administrator" \
    --display_name="Administrator" --user_pass="$PASSWORD"
  wp user delete 1 --yes

  # Switch theme to ours (assuming there's only 1 theme)
  wp theme activate $(wp theme list --field=name --format=csv | head -n 1)

  # Turn all plugins on (delete those that you won't use!)
  wp plugin list --field=name --format=csv | xargs wp plugin activate --quiet
fi
