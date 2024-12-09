import sync from "browser-sync";
import { deleteAsync } from "del";
import gulp from "gulp";
import fileInclude from "gulp-file-include";
import gulpIf from "gulp-if";
import plumber from "gulp-plumber";

import formatHTML from "gulp-format-html";
import removeHtml from "gulp-remove-html";
import ttf2woff2 from "gulp-ttf2woff2";
import webpHtml from "gulp-webp-html-nosvg";

import gulpSass from "gulp-sass";
import bulk from "gulp-sass-bulk-importer";
import dartSass from "sass";

import autoprefixer from "autoprefixer";
import imagemin from "gulp-imagemin";
import postCss from "gulp-postcss";
import webp from "gulp-webp";
import webpCss from "gulp-webpcss";
import minmax from "postcss-media-minmax";

import babel from "gulp-babel";

let isBuildFlag = false;

const sass = gulpSass(dartSass);
const projectFolder = "build";
const sourceFolder = "src";
const path = {
  build: {
    html: projectFolder + "/",
    css: projectFolder + "/styles/",
    js: projectFolder + "/scripts/",
    img: projectFolder + "/images/",
    fonts: projectFolder + "/fonts/",
    libs: projectFolder + "/libs",
  },

  src: {
    html: [sourceFolder + "/pages/**/*.html"],
    css: sourceFolder + "/styles/main.scss",
    js: sourceFolder + "/scripts/main.js",
    img: sourceFolder + "/images/**/*.{jpg,jpeg,png,gif,ico,webp,svg}",
    fonts: sourceFolder + "/fonts/**/*.{ttf,eot,otf,ttc,woff,woff2}",
    libs: sourceFolder + "/libs/**/*.*",
  },

  watch: {
    html: sourceFolder + "/**/*.html",
    css: sourceFolder + "/styles/**/*.{scss,css}",
    js: sourceFolder + "/scripts/**/*.js",
    img: sourceFolder + "/images/**/*.{jpg,jpeg,png,gif,ico,webp,svg}",
    fonts: sourceFolder + "/fonts/**/*.{ttf,eot,otf,ttc,woff,woff2}",
    libs: sourceFolder + "/libs/**/*.*",
  },

  clean: "./" + projectFolder + "/**",
};

export const browserSync = () => {
  sync.init({
    ui: false,
    notify: false,
    browser: "chrome",
    server: {
      baseDir: "./" + projectFolder + "/",
    },
  });
};

export const html = () => {
  return gulp
    .src(path.src.html)
    .pipe(plumber())
    .pipe(fileInclude({ basepath: "src/html/" }))
    .pipe(webpHtml())
    .pipe(gulpIf(isBuildFlag, removeHtml()))
    .pipe(formatHTML())
    .pipe(gulp.dest(path.build.html))
    .pipe(sync.stream());
};

export const css = () => {
  return gulp
    .src(path.src.css, { sourcemaps: !isBuildFlag })
    .pipe(plumber())
    .pipe(bulk())
    .pipe(
      sass({
        outputStyle: "expanded",
      })
    )
    .pipe(
      webpCss({
        webpClass: ".webp",
        noWebpClass: ".no-webp",
      })
    )
    .pipe(postCss([autoprefixer, minmax]))
    .pipe(gulp.dest(path.build.css, { sourcemaps: !isBuildFlag }))
    .pipe(sync.stream());
};

export const js = () => {
  return gulp
    .src(path.src.js, { sourcemaps: !isBuildFlag })
    .pipe(fileInclude())
    .pipe(
      gulpIf(
        isBuildFlag,
        babel({
          presets: ["@babel/preset-env"],
        })
      )
    )
    .pipe(gulp.dest(path.build.js, { sourcemaps: !isBuildFlag }))
    .pipe(sync.stream());
};

export const images = () => {
  return gulp
    .src(path.src.img)
    .pipe(webp())
    .pipe(gulp.dest(path.build.img))
    .pipe(gulp.src(path.src.img))
    .pipe(
      gulpIf(
        isBuildFlag,
        imagemin({
          progressive: true,
          verbose: true,
          optimizationLevel: 3,
        })
      )
    )
    .pipe(gulp.dest(path.build.img));
};

export const libs = () => {
  return gulp.src(path.src.libs).pipe(plumber()).pipe(gulp.dest(path.build.libs)).pipe(sync.stream());
};

export const fonts = () => {
  return gulp
    .src(path.src.fonts)
    .pipe(plumber())
    .pipe(gulp.dest(path.build.fonts))
    .pipe(ttf2woff2())
    .pipe(gulp.dest(path.build.fonts));
};

export const clean = () => {
  return deleteAsync(path.clean);
};

const setMode = (isBuild) => {
  return (cb) => {
    isBuildFlag = isBuild;
    cb();
  };
};

export const watchTask = () => {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.libs], libs);
  gulp.watch([path.watch.fonts], fonts);
  gulp.watch([path.watch.img], images);
};

const watch = gulp.parallel(watchTask, browserSync);

const dev = gulp.parallel(css, html, js, libs, images, fonts);

export const build = gulp.series(clean, setMode(true), dev);

export default gulp.series(clean, dev, watch);
