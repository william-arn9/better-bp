class Settings {
  constructor(visibility) {
    this.visibility = visibility;
    this.timerDuration = 5;
    this.startingLives = 2;
    this.maxLives = 3;
    this.difficulty = 500;
  }

  updateSettings(partialSettings) {
    Object.assign(this, partialSettings);
  }
}

module.exports = Settings;