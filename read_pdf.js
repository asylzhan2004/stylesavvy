const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('X:\\Телеграм папка\\ПОЛОЖЕНИЕ О ДИПЛОМНОЙ РАБОТЕ.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('x:\\gravity folder\\pdf_output.txt', data.text);
    console.log('PDF Extracted successfully!');
}).catch(err => {
    console.error('Error reading PDF:', err);
});
