+++
date = "2017-01-12T23:08:58+08:00"
title = "Recursive wav to mp3 with copy and cleanup"
tags = ["bash", "lame", "encoding", "wav", "mp3", "find", "recursion"]
+++

I have recently been digitizing mine and my wife'   s old cd collection with the resulting files stored to [Waveform Audio File Format (WAV)](https://en.wikipedia.org/wiki/WAV) format under an artist -> album directory structure. 

 My wife however wanted the files in [MPEG-1 and/or MPEG-2 Audio Layer III (MP3)](https://en.wikipedia.org/wiki/WAV) format which the following bash script takes care off.

{{< highlight bash >}}
#!/bin/bash
find . -iname '*.wav' -exec sh -c 'lame -b 320 "$0"' {} \;
find . -type f -iname \*.mp3 -execdir cp {} '/Users/mbramwell/Music/iTunes/iTunes Media/PaulaMp3' \;
find . -iname "*.mp3" -type f -delete;
{{< /highlight >}}

 Call the script from the root directory containing the .wav files, everything is executed via the [find](https://en.wikipedia.org/wiki/Find) command. The first line recursively finds all .wav files and executes [lame](http://lame.sourceforge.net/) to convert the files in place to mp3s. The second line copies the mp3 files to the target directory and the last line deletes the original mp3s created so the wav files can live without inferior encodings cramping their style. 
 
 The resulting copy of the mp3s is in a flat directory which is not an issue for us as iTunes is used to import the resulting mp3s into an artist -> album directory structure using the file metadata.

