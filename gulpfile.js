var webroot = "wwwroot";
var gulp = require("gulp");

var runSequence = require("run-sequence");
var cache = require("gulp-cached");
var del = require("del");
var exec = require("child_process").exec;

var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var tsAotProject = ts.createProject("tsconfig.aot.json");

var launch = require('./Properties/launchSettings.json');
var locales = launch.profiles['Production'].environmentVariables.LOCALES.split(',');

/**
    Copy all files to wwwroot
*/
gulp.task("copy", function (cb) {
    runSequence("copy:nodeMods", "copy:templates", "copy:configuration","copy:resources", cb);
});

/**
    Copy external lib files needed to run the app from node_modules to the webroot.
*/
gulp.task("copy:nodeMods",
    function (callback) {

        //Copy css from node_modules to csslib
        gulp.src([
            //'node_modules/bootstrap/dist/css/bootstrap*.css'
        ],
            { base: "./node_modules/" }
        ).pipe(gulp.dest(webroot + "/csslib/"));

        //copy js files from node_modules to wwwroot/lib. Use base of ./node_modules to retain folder structure (not including the node_modules folder though)
        return gulp.src([
            "node_modules/@angular/**",
            "node_modules/rxjs/**",
            "node_modules/angular-in-memory-web-api/**",
            "node_modules/systemjs/dist/system-polyfills.js",
            "node_modules/systemjs/dist/system.src.js",
            "node_modules/reflect-metadata/Reflect.js",
            "node_modules/zone.js/dist/**",
            "node_modules/core-js/client/**",
            "node_modules/esri-system-js/dist/esriSystem.js"
        ],
            { base: "./node_modules/" }
        ).pipe(gulp.dest(webroot + "/lib/"));

    });



/**
    copy html and css to app folder in webroot.
*/
gulp.task("copy:app-css",
    function () {
        // Copy component css and html files
        return gulp.src("app/**/*.css").pipe(gulp.dest(webroot + "/app"));
    });
gulp.task("copy:app-html",
    function () {
        // Copy component css and html files
        return gulp.src("app/**/*.html").pipe(gulp.dest(webroot + "/app"));
    });
gulp.task("copy:templates",
    function (callback) {
        // Typescript compile is run so our dev build doesn't break
        runSequence("copy:app-css", "copy:app-html", callback);
    });

/**
    copy resources and configuration
*/
gulp.task("copy:resources",
    function () {
        // Copy component css and html files
        return gulp.src("resources/**/*.*").pipe(gulp.dest(webroot + "/resources"));
    });
gulp.task("copy:configuration",
    function () {
        // Copy component css and html files
        return gulp.src("configuration/**/*.*").pipe(gulp.dest(webroot + "/configuration"));
    });
/**
    watch for changes on certain files and run when changed
*/
gulp.task("watch",
    function () {
        gulp.watch("app/**/*.html", ["copy:app-html"]); //copy every time a template file is saved.
        gulp.watch("app/**/*.css", ["copy:app-css"]); //copy every time a template file is saved.
        gulp.watch("resources/**/*.*", ["copy:resources"]); //copy every time a template file is saved.
        gulp.watch("configuration/**/*.*", ["copy:configuration"]); //copy every time a template file is saved.
    });


gulp.task("typescript:compile",
    function () {
        var tsResult = tsProject.src()
            .pipe(tsProject());

        return tsResult.js.pipe(gulp.dest(webroot + "/app"));

    });

gulp.task("typescript:aot-compile",
    function () {
        var tsResult = tsAotProject.src()
            .pipe(tsAotProject());

        return tsResult.js.pipe(gulp.dest(webroot + "/app"));

    });
/**
    Runs some tasks required for a dev build to work.
*/
gulp.task("build:dev",
    function (cb) {
        runSequence("typescript:compile","copy", cb);
    });

/**
    Use Anuglar 2 compiler to ahead of time compile the angular code
*/

gulp.task("dist:ngc-rollup",
    function (cb) {
        var i = 0;

        executeNgCompile(i);
        // God, what have I done?
        function executeNgCompile(iteration) {
            console.log("Running ngc for: " + locales[iteration]);
            exec("node_modules\\.bin\\ngc --i18nFile=./locales/messages." + locales[iteration] + ".xlf --locale=" + locales[iteration] + " --i18nFormat=xlf -p tsconfig.aot.json",
                function executeRollup() {
                    console.log("Running rollup for: " + locales[iteration]);
                    var buildFileName = "wwwroot\\dist\\build." + locales[iteration] + ".js";
                    exec("node_modules\\.bin\\rollup -c rollup.js -o " + buildFileName, function (err, stdout, stderr) {
                        console.log("Rollup finished for " + locales[iteration]);
                        if (iteration === locales.length - 1) {
                            cb(err);
                        }
                        else {
                            executeNgCompile(iteration + 1);
                        }
                    });
                });
        }

    });

/**
    Run the two tasks to compile using ngc and create a build file using rollup. 
    Note: had to add a normal dev typescript compile step after rollup otherwise the non dist build would break. Not sure why?
*/
gulp.task("build:dist",
    function (callback) {
        // Typescript compile is run so our dev build doesn't break
        runSequence("copy", "dist:ngc-rollup", "typescript:compile", callback);
    });