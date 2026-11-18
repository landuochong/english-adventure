// The waiter can identify a sandwich from the food words alone.
export function sandwichAtCounter(text){
 const words=String(text).toLowerCase().replace(/’/g,"'");
 if(/\b(?:not|never|cannot|if|maybe|sold out|unavailable|instead of|no (?:chicken|cheese))\b|n't\b/.test(words))return null;
 if(/^(?:do you have|is there|is the|are the|what|why)\b/.test(words.trim()))return null;
 const foods=new Set(Array.from(words.matchAll(/\b(chicken|cheese|tuna|beef)\s+sandwich(?:es)?\b/g),match=>match[1]));
 return foods.size===1 ? [...foods][0] : null;
}
