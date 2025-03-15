from nltk.corpus import words
from nltk.tokenize import word_tokenize
    
common_words = set(words.words()[:500]) 
print (common_words)

# test is gonna be what we retrieve from the web page 
def detect_buzzwords(text):
    tokens = word_tokenize(text.lower())
    buzzwords = [word for word in tokens if word not in common_words]
    return buzzwords
