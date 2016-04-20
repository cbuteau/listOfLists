
# Link Lists

## Status


[![Build Status](https://travis-ci.org/cbuteau/listOfLists.svg?branch=master)](https://travis-ci.org/cbuteau/listOfLists)



## Concept

The need for multiple shutdown lists of links in tabs.

You take a bunch of tabs and give it a name.
It you call up your list of names and open them.

# TODO

+ Get packaging building in Travis
  * We got the zip creating...BUG for crx..
  * https://github.com/PavelVanecek/gulp-crx/issues/7
+ Test long names.
+ Change text of button for existing key to replace.

+ Start with hover lists...then make them clickable.
http://css.maxdesign.com.au/listamatic/vertical08.htm

+ debug why background-color is not working.
Used Named colors
http://html-color-codes.info/color-names/

+ Hide save buttons and show it if name it typed in.  Do lookup of data-key.

+ finish layout
  * get buttons to align to right of list items. (more css magic.)
  * finally aligned.
+ get package script going.
  * We started with gulp at least zipping the package.
  * we have an outstanding bug for crx
  * we tested gulp.src and that was not the problem.
  * problem is probably deep in crx which gulp-crx-pack is using.

+ Need better graphics for the buttons.
  * First pass with InkScape...better

Cleaning pass of HTML and javascript.

+ maybe add jquery and hook events that way instead.
http://stackoverflow.com/questions/21317476/how-to-use-jquery-in-chrome-extension
