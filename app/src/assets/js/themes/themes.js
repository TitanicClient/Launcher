const date = new Date();
let showSnowflakes = date.getMonth() == 11;

// Currently only snowflakes for December
function loadTheme() {
    if (showSnowflakes || DEBUG) {
        let snowflakes = ""; // 12
    
        for (let i = 0; i < 12; i++) {
            snowflakes += `<div class="snowflake"><img width="16" height="16" src="assets/img/theme/snowflake.png"></div>`;
        }

        document.getElementById("theme-override").innerHTML = snowflakes;
    }
}