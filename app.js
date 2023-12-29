const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// データを保存するためのテキストファイル
const dataFilePath = 'data.txt';

// 管理番号を保持する変数
let imageCounter = 1;

// 画像アップロードの設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// 画像の表示
app.use('/img', express.static('uploads'));

// 画像アップロード画面の表示
app.get('/img', (req, res) => {
  res.sendFile(__dirname + '/upload.html');
});

// 画像アップロード処理
app.post('/img/upload', upload.single('image'), (req, res) => {
  const { originalname } = req.file;
  const { name } = req.body;

  // 管理番号を付与してデータを保存
  const data = `${imageCounter},${originalname},${name}\n`;
  fs.appendFileSync(dataFilePath, data);

  // 管理番号をインクリメント
  imageCounter++;

  res.redirect('/img-all');
});

// 保存されたすべての画像を表示
app.get('/img-all', (req, res) => {
  const data = fs.readFileSync(dataFilePath, 'utf8');
  const lines = data.trim().split('\n');
  const images = lines.map(line => {
    const [id, filename, uploadedBy] = line.split(',');
    return { id, filename, uploadedBy };
  });

  res.json(images);
});

app.get('/img/:id', (req, res) => {
  const id = req.params.id;
  const data = fs.readFileSync(dataFilePath, 'utf8');
  const lines = data.trim().split('\n');
  const line = lines.find(line => line.startsWith(`${id},`));

  if (line) {
    const [_, filename, uploadedBy] = line.split(',');
    res.sendFile(path.join(__dirname, 'uploads', filename));
  } else {
    // 画像が見つからない場合は、noimage.jpg を表示
    const noImagePath = path.join(__dirname, 'uploads', 'noimage.jpg');
    res.sendFile(noImagePath);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
