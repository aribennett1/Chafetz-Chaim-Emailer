# Chafetz-Chaim-Emailer
This Google Apps Script automates the process of retrieving the next audio file in a sequence and emailing it every night at 10:30. The script excludes Saturdays and Jewish holidays from sending emails. Additionally, if certain audio files make reference to a jpg chart, the script attaches the chart to the email in addition to the audio file.

## Features

- Retrieves the next audio file in the current sequence.
- Sends an email every night at 10:30, excluding Saturdays and Jewish holidays.
- Attaches a chart to the email for certain audio files which reference it.

## Usage

Once the script is set up and configured, it will automatically run every night at 10:30. It will check for the next audio file in the sequence, attach any associated PDF chart, and send the email to the specified recipient.

## Limitations

- The script relies on the Hebcal API for excluding Jewish holidays.

## Audio Files Hosting
The audio files used by this script are hosted in a Google Drive folder which can be accessed using the following link: [https://drive.google.com/drive/folders/1qB2Ffr4thmyphW5I_KNjojTMsMwX7Lot?usp=sharing](https://drive.google.com/drive/folders/1qB2Ffr4thmyphW5I_KNjojTMsMwX7Lot?usp=sharing)
