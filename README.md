# redandblue skeleton
This repository is the standard starting place for new WordPress projects.

Clone it, create a new repository for your new project, and edit `composer.json` to include entries for premium plugins or remove those you will not need. You'll find most often used premium plugins in `composer.premium.sample.json`. Just add licence keys. You'll also want to edit `package.json` and change the package name to something other than skeleton.

After that simply run `yarn` to kickstart the complicated scripts and get going. The scripts may or may not ask you intimidating questions. Answer all of them and be honest.

After the mist clears, absolutely nothing seems to have happened. It's time to kickstart Vagrant. Relevant documentation can be found at [seravo/wordpress](https://github.com/seravo/wordpress).

Assuming you've done something like this before (that means you've already configured Vagrant), running `vagrant up` should do it. Otherwise consult the documentation above. You will be told some things during the installation and you may be asked some questions. Don't read the questions, just blindly skip them by pressing <kbd>Enter</kbd>.

# Requirements
- NodeJS: v6 or later
- PHP: 7.1 (not really, but strive for it)
- Composer: Installed on machine
- Yarn: Installed on machine

# Deploying

## Before
If your project has dependencies that need to run scripts on deploy, add those scripts to composer.json. Prime example would be themes: `cd htdocs/wp-content/themes/theme-skeleton; composer install;`. The theme will run whatever it needs to run when `composer install` is triggered  in the theme. 

## Actually deploying
Add production as a remote (`git remote add production ssh://site@site.seravo.fi:10000/data/wordpress`) and run `git push production`. Production is configured to trigger `composer install` on post-receive hook.

`composer install` will install the dependencies listed in composer.json using the versions from composer.lock. Your themes are listed as dependencies. To deploy changes to a theme, update the theme repository, and update this project to use the latest and greatest version of your theme with `composer update`. After Composer is ready, add the changed files with `git add composer*`, create a commit with `git commit -m "Update theme"` and finally run `git push production`.

```
# After you've updated your theme
composer update
# Wait for it to complete, then test that the site still works on your local environment
git add composer*
git commit -m "Update theme"
git push production
# If everything goes well, update origin too
git push origin
```

_TODO: Replace with Travis or Circle CI._

# Updating
This leeches on seravo/wordpress. It's great, but this enables customizations. When Seravo releases updates, *make a backup* and run `./update-core.sh`. That will fetch the latest package (living on the edge) and merge our important files with it before merging the package back .

I've tried to keep core file editing to a minimum, but some files such as Vagrantfile require manual attention if they change with the latest update.
