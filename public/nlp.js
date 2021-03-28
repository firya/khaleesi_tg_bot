import natural from "natural";

import { readFile } from "fs/promises";

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

  getSentiment = (text, debug = false) => {
    var words = this.tokenizer.tokenize(text);

    let score = 0;
    let negator = 1;

    var info = [];

    words.forEach((token) => {
      const lowerCased = token.toLowerCase();
      if (this.russianNegations.words.indexOf(lowerCased) > -1) {
        negator = -1;
      } else {
        if (this.vocabulary[lowerCased] !== undefined) {
          score += negator * this.vocabulary[lowerCased];
          info.push(`${lowerCased}: ${score}`);
        } else {
          if (this.stemmer) {
            const stemmedWord = this.stemmer.stem(lowerCased);
            if (this.vocabulary[stemmedWord] !== undefined) {
              score += negator * this.vocabulary[stemmedWord];
              info.push(`${stemmedWord}: ${score}`);
            }
          }
        }
      }
    });
    score = score / words.length;

    var result = {
      score: score,
    };

    console.log(info);

    if (debug) {
      result.info = info;
    }

    return result;
  };
}
