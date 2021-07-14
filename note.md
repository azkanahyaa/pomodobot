#  TODO

## Struktur Data

**Key**
users id

**Object**
{\
  id: `user id`\
  sticker: `sticker id` \
  template: `template id`\
  reset: `reset time`\
  todo:  `[ [status, desc], ... ]`\
}

## Sticker Flow
- Server Set Sticker `,a set sticker`
- User Choose Template `,a Sticker`
- Data Structure: *id, name, stickers, vip*

## Template Flow
- Global Template `,a template global` | `,a template id` | `,a template @mentions`
- User Upload, edit, unpublish Template `,a template`: used, mine
- User choose Template `,a set template`
- User Edit Template if user want
- Record Template Users
- Data Structure: *id, name, author, template, users*