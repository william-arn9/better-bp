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
  getTransformedSettings() {
    return {
      visibility: this.visibility,
      timer: this.timerDuration,
      lives: this.startingLives,
      maxLives: this.maxLives,
      difficulty: this.difficulty
    };
  }
}

module.exports = Settings;