/*Copyright 2017 David hamp-gonsalves 

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.*/

function levenshtein(source, target) {
	// This function measures the Damerau-levenshtein distance between two strings
	// Levenshtein distance is the minimum number of opperations 
	// (Deletion, Insertion and Substitution)
	// to get from string1 to string2
	// Damerau-levenshtein additionally allows Transposition.
	//
	// Other measures of string distance allow or disallow other opperations.
  if (!source || source.length === 0)
    if (!target || target.length === 0)
      return 0;
    else
      return target.length;
  else if (!target)
    return source.length;

  var sourceLength = source.length;
  var targetLength = target.length;
  var score = [];

  var INF = sourceLength + targetLength;
  score[0] = [INF];
  for (var i=0 ; i <= sourceLength ; i++) { score[i + 1] = []; score[i + 1][1] = i; score[i + 1][0] = INF; }
  for (var i=0 ; i <= targetLength ; i++) { score[1][i + 1] = i; score[0][i + 1] = INF; }

  var sd = {};
  var combinedStrings = source + target;
  var combinedStringsLength = combinedStrings.length;
  for(var i=0 ; i < combinedStringsLength ; i++) {
    var letter = combinedStrings[i];
    if (!sd.hasOwnProperty(letter))
      sd[letter] = 0;
  }

  for (var i=1 ; i <= sourceLength ; i++) {
    var DB = 0;
    for (var j=1 ; j <= targetLength ; j++) {
      var i1 = sd[target[j - 1]];
      var j1 = DB;

      if (source[i - 1] == target[j - 1]) {
        score[i + 1][j + 1] = score[i][j];
        DB = j;
      }
      else
        score[i + 1][j + 1] = Math.min(score[i][j], Math.min(score[i + 1][j], score[i][j + 1])) + 1;

      score[i + 1][j + 1] = Math.min(score[i + 1][j + 1], score[i1][j1] + (i - i1 - 1) + 1 + (j - j1 - 1));
    }
    sd[source[i - 1]] = i;
  }
  return score[sourceLength + 1][targetLength + 1];
}