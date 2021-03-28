import natural from "natural";

var tokenizer = new natural.WordTokenizer();
var Analyzer = natural.SentimentAnalyzer;
var stemmer = natural.PorterStemmerRu;
var analyzer = new Analyzer("Russian", stemmer, "afinn");

var data = [
  "Пиздец",
  "Пиздато",
  "Хуево",
  "Охуенно",
  "Заебал",
  "Иди нахуй",
  "Ты пидор",
  "Пиздец все хуево",
  "как же охуенно",
];

console.log(natural.PorterStemmerRu.stem("как же охуенно"));

data.map((text) => {
  analyzer.getSentiment(tokenizer.tokenize(natural.PorterStemmerRu.stem(text)));
});
