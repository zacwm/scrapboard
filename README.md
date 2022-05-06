<p align="center">
  <img src="https://zachary.lol/assets/banner.png"/>
</p>

# scrapboard

## [Live version](https://banner.zachary.lol/)

### What is it?
A simple fabric.js canvas thing I was playing with and turned it into a small/quick project. Mainly using EJS, Express JS, MongoDB and Socket.IO

It's purpose is to allow anyone to login with their Discord account (so I can moderate & limit abusers) and add a image to place on my banner. Once placed they can submit it for my approval.

### Setup for yourself
**Forgot a step that is important about the initial banner in the DB, will eventually add something that automatically prepares a blank banner**

Not much to it, just rename the `config.template.js` to `config.js` and edit it. Install the node packages, and run it with `npm start`

### Future plans
- *Actually have readable code* LOL. It was pretty rushed because of an assignment I have coming up.
- **I want to clean up the DB querys and loading of images via sockets and initial page loadings. This will be something happening soon in my free time.** This includes cleaning up socket requests to make them more understandable and useful in other areas such as the admin panel.
- Fix some admin things that can make it scary to operate.
- I *did* want to make this with React, but after some issues with finding a canvas libray, I decided to use Fabric.js as it did exactly what I wanted, however it doesn't have an official React library and I was struggling with the one individual port of it, and this is a small project that I can't spend lots of time working on right now. I'll likely create a React version still using fabric.js for my portfolio in the future.