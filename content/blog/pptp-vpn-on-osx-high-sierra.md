+++
date = "2018-08-01T16:01:00+08:00"
title = "PPTP VPN on OSX High Sierra"
tags = ["vpn","osx", "pptp", "tips"]
+++

Connecting to VPN from OSX (since a few mountain named versions ago) via PPTP is no longer an OS OOTB option.

You can either try your luck with some third party VPN options which did not work for me (probably due a timeout issue I will address shortly) or you can roll your own client following the straightforward [instructions]( https://filipmolcik.com/pptp-vpn-on-macos-sierra-and-high-sierra/) provide by [Filip Molcik](https://filipmolcik.com/about-me/), with the addition of the following lines to the configuration file which address timeout disconnection issues:

{{< highlight bash >}}
lcp-echo-interval 60
lcp-echo-failure 3
{{< /highlight >}}

All together the steps to follow are:

Open terminal and create file with name of your vpn server in /etc/ppp/peers/

{{< highlight bash >}}
sudo touch /etc/ppp/peers/vpn.thedomainname.com.au
{{< /highlight >}}

If you get an error, because the peers folder doesn’t exist, create it with mkdir /etc/ppp/peers command). Then edit this newly created file

{{< highlight bash >}}
sudo nano /etc/ppp/peers/vpn.thedomainname.com.au
{{< /highlight >}}

Copy paste and fill your details (note the last two additonal lines)

{{< highlight bash >}}
plugin PPTP.ppp
noauth
remoteaddress "vpn.thedomainname.com.au"
user "------USERNAME------"
password "------PASSWORD------"
redialcount 1
redialtimer 5
idle 1800
# mru 1368 
# mtu 1368
receive-all
novj 0:0
ipcp-accept-local
ipcp-accept-remote
refuse-eap
refuse-pap
refuse-chap-md5
hide-password 
mppe-stateless
mppe-128
# require-mppe-128
looplocal
nodetach
ms-dns 8.8.8.8
usepeerdns
# ipparam gwvpn
defaultroute
debug
lcp-echo-interval 60
lcp-echo-failure 3
{{< /highlight >}}

And finally run pppd deamon

{{< highlight bash >}}
sudo pppd call vpn.thedomainname.com.au
{{< /highlight >}}

If you get PPTP error when reading socket : EOF just try run the command again, or comment out the the line with ms-dns 8.8.8.8

To create this command as an app see the Automator instructions in the aforementioned link. If your preference is to save as as a bash script then create a text file and with the following lines

{{< highlight bash >}}
#!/bin/bash
sudo pppd call vpn.thedomainname.com.au
{{< /highlight >}}

Save the file using .sh file extension e.g vpn-thedomainname.sh and make it executable

{{< highlight bash >}}
sudo chmod +x vpn-thedomainname.sh
{{< /highlight >}}

**Remote Desktop Client**
[Microsoft Remote Desktop](https://docs.microsoft.com/en-us/windows-server/remote/remote-desktop-services/clients/remote-desktop-mac) client available from the app store seems to do the job
Use the FQDN for the connection name e.g 

{{< highlight bash >}}
theserver.thedomainname.com.au 
{{< /highlight >}}

Username does not need the domain name however you do need to setup a gateway which does require the domain in the username e.g 

{{< highlight bash >}}
thedomainname\mbramwell
{{< /highlight >}}