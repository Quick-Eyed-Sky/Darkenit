# Publish Darken It on GitHub

This guide assumes the GitHub owner is `Quick-Eyed-Sky` and the repository name is `Darkenit`. The README, issue, release, and Twitter links use this proposed repository address:

`https://github.com/Quick-Eyed-Sky/Darkenit`

If you choose another repository name, replace `DarkenIt` in those links before publishing.

## Part 1: Publish the project folder with GitHub Desktop

The project folder already has a local Git repository and a first commit. You do not need to create a repository on the GitHub website first.

### First, check the commit author

The prepared commit uses the Git author name configured on this Mac and the email address you supplied. Commit names and email addresses are part of the public Git history. If you do not want your personal email shown on GitHub, replace it with the `@users.noreply.github.com` address listed in GitHub **Settings → Emails** before publishing.

To change the identity before publishing, open Terminal and run these commands. Change the name too if needed:

```sh
cd /Users/jpm/Desktop/Claude/Darken
git config user.name "Your Name"
git config user.email "your-github-noreply-address"
git commit --amend --reset-author --no-edit
```

Return to GitHub Desktop after the command finishes.

### Then publish the repository

1. Install and open [GitHub Desktop](https://desktop.github.com/), then sign in to your GitHub account.
2. Choose **File → Add Local Repository…**.
3. Click **Choose…** and select this exact project folder: `/Users/jpm/Desktop/Claude/Darken`.
4. Click **Add Repository**. If GitHub Desktop shows the files and the current branch (`main`), you selected the right folder.
5. Click **Publish repository** near the top of the window.
6. In the publish window, set **Name** to `Darkenit` and confirm the owner is `Quick-Eyed-Sky`.
7. Leave **Keep this code private** unchecked if you want everyone to see the repository.
8. Click **Publish Repository**. GitHub Desktop creates the GitHub repository and uploads the committed files.

Do not create a second repository with the same name. If `Quick-Eyed-Sky/Darkenit` already exists, clone it in GitHub Desktop first, copy the project files into that cloned folder without copying the hidden `.git` folder, then commit and push.

### Alternative: create the empty repository on GitHub first

If you prefer to start on the GitHub website, open [github.com/new](https://github.com/new), enter `Darkenit`, choose **Public**, and leave the README, `.gitignore`, and license options unchecked. After creating it, open Terminal in this project folder and run:

```sh
git remote add origin https://github.com/Quick-Eyed-Sky/Darkenit.git
git push -u origin main
```

GitHub may ask you to sign in or authorize the push. These commands upload the existing local commit; they do not create the downloadable release yet.

## Part 2: Create the first downloadable release

The README's **Download Darken It** link points to the latest GitHub release. It will start working after the first release is published.

1. In the GitHub repository, click **Releases**. If you do not see it, open `https://github.com/Quick-Eyed-Sky/Darkenit/releases`.
2. Click **Draft a new release**.
3. In **Choose a tag**, type `v1.0.0`, then choose **Create new tag: v1.0.0 on publish**. Set the target to the `main` branch if GitHub asks.
4. For **Release title**, enter `Darken It v1.0.0`.
5. Drag `dist/DarkenIt-v1.0.0.zip` from this project folder into the release's file attachment area. The `dist` folder is intentionally excluded from the source repository; it stays on your computer so you can attach the ZIP.
6. Leave **Set as a pre-release** unchecked, then click **Publish release**.
7. Open the repository README and click **Download Darken It**. Confirm that it opens the release page and that the ZIP appears under **Assets**.

The ZIP contains the extension files and the MIT `LICENSE` at its top level, including `_locales/en/messages.json` and `_locales/fr/messages.json`. After extracting it, users select the folder containing `manifest.json` when they choose Chrome's **Load unpacked** button.

## Part 3: Add repository details

On the repository page, find the **About** area and click its gear icon. Suggested details:

- **Description:** `A small Chrome extension that dims bright websites and remembers your preferred level for each site.`
- **Website:** `https://github.com/Quick-Eyed-Sky/Darkenit/releases/latest`
- **Topics:** `chrome-extension`, `brightness`, `chrome`, `website-tools`

Do not add a Chrome Web Store link until the extension has actually been approved and published there.

## Part 4: Share it on Twitter/X

The ready-to-post English text is in [`TWEET.txt`](TWEET.txt). Its GitHub link will work after Part 1.

## Updating the extension later

1. Make your changes in this project folder.
2. Update the `version` value in `manifest.json` (for example, change `1.0.0` to `1.0.1`).
3. Make a new ZIP with that version in its filename. On your Mac, open Terminal and run the commands below. Change `1.0.1` in the two commands to match the version in `manifest.json`.

   ```sh
   cd /Users/jpm/Desktop/Claude/Darken
   rm -f dist/DarkenIt-v1.0.1.zip
   zip -r dist/DarkenIt-v1.0.1.zip manifest.json background.js content.js popup.html popup.css popup.js icon16.png icon48.png icon128.png LICENSE _locales/en/messages.json _locales/fr/messages.json
   ```

   Include both locale files or Chrome cannot show the English and French interface.
4. Commit and push the changes using GitHub Desktop.
5. Create a new GitHub release with a matching tag and title, such as `v1.0.1` and `Darken It v1.0.1`, and attach the new ZIP.

## Before submitting to the Chrome Web Store

The Chrome Web Store is a separate publishing process from GitHub. The developer must register a publisher account, complete the store listing and privacy declarations, upload the extension ZIP, and submit it for Google's review. Approval is not automatic.

Before submission, review the permissions in `manifest.json`. Darken It currently requests access to all websites so its per-site feature can work on any site. The store listing should explain this clearly, and the permission scope should be kept as narrow as the product's features allow. The repository includes the MIT License in `LICENSE`; make sure the displayed copyright holder is the name you want associated with the project before publishing.
