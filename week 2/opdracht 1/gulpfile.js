var gulp = require('gulp'),
cleanCSS = require('gulp-clean-css'),
minify = require('gulp-minify'),
watch = require('gulp-watch'),
browserSync = require('browser-sync').create(),
autoprefixer = require('gulp-autoprefixer');

var sass = require('gulp-sass');

gulp.task('default',['watch_css','watch_html','sync']);
// gulp.task('build',['minify_css','minify_js']);

// gulp.task('minify_css',function(){
// 	return gulp.src('css/*.css')
// 		.pipe(cleanCSS())
// 		.pipe(autoprefixer())
// 		.pipe(gulp.dest('dist/css'))
// 		.pipe(browserSync.stream());
// })

// gulp.task('minify_js',function(){
// 	return gulp.src('js/*.js')
// 		.pipe(minify({
// 			noSource: true,
// 			ext : {
// 				min : '.js'
// 			}
// 		}))
// 		.pipe(gulp.dest('dist/js'))
// 		.pipe(browserSync.stream());
// })
 
// gulp.task('sass', function () {
//   return gulp.src('./sass/**/*.scss')
//     .pipe(sass().sync().on('error', sass.logError))
//     .pipe(gulp.dest('./css'));
// });
 
// gulp.task('sass:watch', function () {
//    return gulp.watch('./sass/**/*.scss', ['sync_page','sass']);
// });

// gulp.task('sass', function () {
//   return gulp.src('./sass/**/*.scss')
//     .pipe(sass.sync().on('error', sass.logError))
//     .pipe(gulp.dest('./css'));
// });
 
// gulp.task('sass:watch', function () {
//   gulp.watch('./sass/**/*.scss', ['sass']);
// });










gulp.task('watch_css',function(){
	return gulp.watch(['*.css'],['sync_page']);
})

// gulp.task('watch_html',function(){
// 	return gulp.watch(['*.html'],['sync_page']);
// })

gulp.task('watch_html', function () {
    return gulp.watch(['*.html']).on('change', browserSync.reload);
});

gulp.task('sync_page',function(){
	return gulp.src('./css/*.css')
	.pipe(browserSync.stream());
})

// gulp.task('watch_js',['minify_js'],function(){
// 	return gulp.watch(['js/*.js'],['minify_js']);
// })

gulp.task('sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
});