# Birthday Surprise App

Open `Start-Birthday-App.bat` to view the surprise with automatic image-folder loading.

You can also open `index.html` directly, but direct browser opening may not allow automatic folder scanning.

Edit `script.js` to personalize:

- `birthdayPassword`: password entered on the unlock screen, in `DDMMYYYY` format.
- `birthdayDate`: countdown target date.
- `memories`: timeline messages and photo placeholders.
- `gallery`: slideshow captions and image paths.

To use real photos automatically, copy `.jpg`, `.jpeg`, `.png`, `.webp`, or `.gif` files into the `images` folder and open the app with `Start-Birthday-App.bat`. The launcher updates `images-manifest.js` with the real filenames.

To use a real song automatically, copy one `.mp3`, `.m4a`, `.ogg`, or `.wav` file into the `music` folder and open the app with `Start-Birthday-App.bat`. The launcher updates `music-manifest.js`. Browsers start music after the unlock click.

If you open `index.html` directly, automatic loading works best with simple names such as `1.jpg`, `2.jpg`, `photo1.png`, or `greeshma1.jpg`.

You can still set an image path manually like:

```js
image: "images/greeshma-photo-1.jpg"
```

Current default unlock password: `12062007`.
