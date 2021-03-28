import natural from "natural";

import { readFile } from "fs/promises";

// import russianAfinnVoca from "./Russian/afinn_ru.json";
// import russianNegations from "./Russian/negations_ru.json";

export default class SentimentAnalyzer {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmerRu;

    this.loadJSON();
  }

  loadJSON = async () => {
    this.russianAfinnVoca = JSON.parse(
      await readFile(new URL("./Russian/afinn_ru.json", import.meta.url))
    );
    this.russianNegations = JSON.parse(
      await readFile(new URL("./Russian/negations_ru.json", import.meta.url))
    );

    this.vocabulary = Object.assign({}, this.russianAfinnVoca);
  };

  getSentiment = (text) => {
    var words = this.tokenizer.tokenize(text);

    let score = 0;
    let negator = 1;
    words.forEach((token) => {
      const lowerCased = token.toLowerCase();
      if (this.russianNegations.words.indexOf(lowerCased) > -1) {
        negator = -1;
      } else {
        if (this.vocabulary[lowerCased] !== undefined) {
          score += negator * this.vocabulary[lowerCased];
        } else {
          if (this.stemmer) {
            const stemmedWord = this.stemmer.stem(lowerCased);
            if (this.vocabulary[stemmedWord] !== undefined) {
              score += negator * this.vocabulary[stemmedWord];
            }
          }
        }
      }
    });
    score = score / words.length;
    return score;
  };
}
