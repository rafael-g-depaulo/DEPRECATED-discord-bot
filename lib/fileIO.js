/**

* @author Rafael 'Ragan' Gonçalves
 * @fileOverview Manages file reading and writing
 */

// loading modules
const fs = require('fs'),
  path = require('path');

/**
 * @description reads a file and returns it's buffer as a String
 * 
 * @param {string} relPath The relative path of the file to be read.
 * 
 * @returns {string} The file's content, as a String
 */
exports.read = function (relPath) {
  return fs.readFileSync(path.join(__dirname, relPath), 'utf8');
}

/**
 * @description writes data to a file assyncronously
 * 
 * @param {string} relPath  The relative path of the file to be writen in.
 * @param {string} data     The data to write into the file.
 */
exports.write = function (relPath, data) {
  fs.writeFile(path.join(__dirname, relPath), data, 'utf8', (err) => {
    if (err)
      console.log("ERROR: " + err);
    else
      console.log("Sucessfull Write: ./" + relPath)
  });
}

/**
 * @description writes data to a file assyncronously
 * 
 * @param {string} relPath  The relative path of the file to be writen in.
 * @param {string} data     The data to write into the file.
 */
exports.writeSync = function (relPath, data) {
  fs.writeFileSync(path.join(__dirname, relPath), data, 'utf8');
  console.log("Sucessfull Write: ./" + relPath);
}

/**
 * @description checks if file exists syncronously
 * 
 * @param {string} relPath  The relative path of the file to be writen in.
 */
exports.existsSync = (relPath) => fs.existsSync(path.join(__dirname, relPath))