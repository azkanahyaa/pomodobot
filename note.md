# Pomodoro

## Struktur Data

> key : idChannel

> Object
{
  host, channel, settings, interval, embed, endTime
}

## Flow Code

- create channel and data
- add to discord collection
- add interval, endTime, and Embed if pmd start (addDB)
- clear if pmd done (clearDB)

- if restart put DB
- run interval with the 

> change DB in { channel Created, pmd start, pmd end }


initial Channel: channelId
default: 
- focus
- short break
- long break
- loop
- interval
---
- limit
- silent lv