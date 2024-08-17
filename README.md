# Getting Started with Bombparty

Bombparty is a word-based web game originally developed by Sparklin Labs. Players join the game at the start of a round, then the game commenses in a turn-based approach. Each player has a configured amount of time (2-10 seconds) to type a word that contains a given prompt of two or three letters. The player will lose a life if they do not enter the word in time. The last player standing is the winner.

## Difficulty

The difficulty of the game is variable based on a _words per prompt (wpp)_ concept. Each prompt (ex. GA, RE, ICH) has a number of possible solutions. The default difficulty is min-500 wpp which means each prompt will have a minimum of 500 possible solutions. The game can be played at various difficulties but typically min-500 wpp is considered easy for new players, and min-100 wpp is considered difficult for new players. Some experienced players will play very difficult modes such as max-100 wpp.

## Structure

This project is a fullstack mono-repo. The frontend is React and the backend is a Node Express API. The application is currently only configured for a dev-mode deployment with the server running on port 4000 and the UI running on port 3000.

The React app uses Tailwind for styling. As a result, minimal styling documents are present in the application. All new styling should be written as Tailwind classes.

## Available Scripts

In the project directory, you can run:

### `npm install`

Remember to run this command after cloning the repo to ensure you install the necessary packages to run the application.

### `npm run start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

# Some React Notes

The remainder of the doc is boilerplate React read-me for reference materials.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
