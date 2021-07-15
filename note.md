help command:

- header: Aruphin Command List; image: bot avatar
- Description: 
 ~ prefix
 ~ usage
 ~ help usage
 ~~ add fields every commands: title: commands, value: description
- footer: Ruang Belajar Official Bot; image: RB icon gif


help spesifik command:
- get args[0]
- check command
- show embed:
  ~ command
  ~ desc
  ~ Aliases
  ~ Penggunaan
  ~ contoh

#
#  Pomodoro

**Desc:**
> Menampilkan pengaturan pomodoro di channel pengguna. Kamu hanya bisa menggunakan command ini saat berada di voice channel pomodoro

**Args:** 
> (max-length: 1)
> <focus | break | start | end> 

> - focus: memulai hitung mundur untuk fokus.
> - break: memulai hitung mundur untuk istirahat.
> - start: memulai Pomodoro dengan sistem *auto start* (Istirahat langsung dihitung mundur setelah fokus selesai, dan sebaliknya, sebanyak jumlah perulangan yang diatur).
> - end: menghentikan hitungan

**Alias:**
> pmd, pomod 

#
# Setup

**Desc:**
> Mengatur berbagai hal yang diperlukan untuk fitur lain pada bot

**Args:** 
>  (max-length: 2)

> *Staff Only*: < pomodoro  | reminder | template >
> 
> - pomodoro : Mengatur *Initial voice*, dan pengaturan default pomodoro di server tersebut
> - reminder: Mengatur *set reminder* dan *reminder*  channel untuk server
> - template: Mengatur template sticker to do list untuk server

> *All Member*: < todo  | break | focus | loop >
> 
> - todo : Mengatur Daily to do list pengguna
> - break : Mengatur durasi istirahat pomodoro (sub-args: value)
> -  focus: Mengatur durasi focus pomodoro (sub-args: value)
> - loop: Mengatur pengulangan pomodoro pada mode autostart (sub-args: value)

**Alias:**
> setting, set

#
#  Template

**Desc:**
> Memilih template sticker to do list yang akan digunakan untuk menunjukan status to do list (default, onGoing, done, fail)

**Args:** 
>  (max-length: 1)
> < id >

> tanpa id template : melihat dan/atau memilih satu per satu template server
> dengan id template : melihat dan/atau memilih template dengan id tersebut 

**Alias:**
> tem, tpl, sticker

#
# Todo

**Desc:**
> Melihat to do list pengguna di hari tersebut atau mengatur status item to do list menjadi default, onGoing, done, atau fail

**Args:** 
>  (max-length: 2)

> args[0]: *nomor item to do list*
> args[1]: status item to do list yang ingin di ubah (default, ongoing, done, fail)

**Alias:**
> todolist, td, daily