+++
date = "2018-08-04T22:59:00+08:00"
title = "Your license has gone stale and must be updated"
tags = ["visual-studio","bug", "work-around"]
+++

When authenticating Visual Studio 2015 Enterprise via your MSDN email/password Visual Studio attempts to re-validate its auth token, if you encounter the following UAC/VS bug you will be stuck with a 'Your license has gone stale and must be updated' and clicking on 'Unlock with a Product Key' will do nothing. A reminder that the old Microsoft still likes to rear its ugly head from time to time. 

The fix taken from [Dinesh's blog] (http://dineshvr.blogspot.com/2016/08/visual-studio-message-your-license-has.html) assumes Windows Server 2012 R2 using Visual Studio 2015 Enterprise.

1. Go to Control Panel
2. Search UAC
3. Click on Action Center, Change User Account Control Settings
4. Make a note of the current slider setting
5. Turn the slider all the way to the bottom (ie; Never notify option) and click OK
6. Go back to visual studio and check the update license, and voila, the licence updated
7. Revert UAC original setting by going back to UAC and apply the original value (Step 4)