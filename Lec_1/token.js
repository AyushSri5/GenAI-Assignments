class CustomTokenizer {
    constructor() {
      // Predefined vocabulary
      this.vocab = {
        "<PAD>": 0,
        "<UNK>": 1,
        "<CLS>": 2,
        "<SEP>": 3,
        "hello": 4,
        "world": 5,
        "this": 6,
        "is": 7,
        "a": 8,
        "test": 9
      };
  
      // Reverse vocabulary for decoding
      this.idToToken = Object.fromEntries(
        Object.entries(this.vocab).map(([k, v]) => [v, k])
      );
    }
  
    encode(text) {
      const words = text.split(/\s+/);
      return words.map(word => this.vocab[word] ?? this.vocab["<UNK>"]);
    }
  
    decode(tokenIds) {
      return tokenIds.map(id => this.idToToken[id] ?? "<UNK>").join(" ");
    }
  }
  
  // Example usage
  const tokenizer = new CustomTokenizer();
  
  const text = "hello world this is ai";
  const encoded = tokenizer.encode(text);
  console.log("Encoded:", encoded);
  
  const decoded = tokenizer.decode(encoded);
  console.log("Decoded:", decoded);
  