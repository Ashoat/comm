<?php

require_once('config.php');
require_once('auth.php');
require_once('verify_lib.php');
require_once('calendar_lib.php');

if ($https && !isset($_SERVER['HTTPS'])) {
  // We're using mod_rewrite .htaccess for HTTPS redirect; this shouldn't happen
  header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
  exit;
}

$year_rewrite_matched = preg_match(
  '#/year/([0-9]+)(/|$)#i',
  $_SERVER['REQUEST_URI'],
  $year_matches
);
$year = $year_rewrite_matched ? (int)$year_matches[1] : idate('Y');
$month_rewrite_matched = preg_match(
  '#/month/([0-9]+)(/|$)#i',
  $_SERVER['REQUEST_URI'],
  $month_matches
);
$month = $month_rewrite_matched ? (int)$month_matches[1] : idate('m');
$calendar_rewrite_matched = preg_match(
  '#/calendar/([0-9]+)(/|$)#i',
  $_SERVER['REQUEST_URI'],
  $calendar_matches
);
$home_rewrite_matched = preg_match('#/home(/|$)#i', $_SERVER['REQUEST_URI']);
if (!$home_rewrite_matched && $calendar_rewrite_matched) {
  $home = false;
  $calendar = (int)$calendar_matches[1];;
} else {
  $home = true;
  $calendar = null;
}

$calendar_infos = get_calendar_infos();
if (!$home && !isset($calendar_infos[$calendar])) {
  $result = $conn->query("SELECT id FROM calendars WHERE id = $calendar");
  $calendar_id_check_row = $result->fetch_assoc();
  if (!$calendar_id_check_row) {
    header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
    exit;
  }
}

$month_beginning_timestamp = date_create("$month/1/$year");
if ($month < 1 || $month > 12) {
  header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
  exit;
}

$null_state = null;
if ($home) {
  $null_state = true;
  foreach ($calendar_infos as $calendar_info) {
    if ($calendar_info['subscribed']) {
      $null_state = false;
      break;
    }
  }
} else {
  $null_state = !isset($calendar_infos[$calendar])
    || !$calendar_infos[$calendar]['authorized'];
}

$verify_rewrite_matched = preg_match(
  '#/verify/([a-f0-9]+)(/|$)#i',
  $_SERVER['REQUEST_URI'],
  $verify_matches
);
$verify_code = $verify_rewrite_matched ? $verify_matches[1] : null;

$reset_password_username = null;
$verify_field = null;
if ($verify_code) {
  $verify_result = verify_code($verify_code);
  if ($verify_result) {
    list($verify_user, $verify_field) = $verify_result;
    if ($verify_field === VERIFY_FIELD_EMAIL) {
      $conn->query(
        "UPDATE users SET email_verified = 1 WHERE id = $verify_user"
      );
      clear_verify_codes($verify_user, $verify_field);
    } else if ($verify_field === VERIFY_FIELD_RESET_PASSWORD) {
      $result = $conn->query(
        "SELECT username FROM users WHERE id = $verify_user"
      );
      $reset_password_user_row = $result->fetch_assoc();
      $reset_password_username = $reset_password_user_row['username'];
    }
  }
}

$viewer_id = get_viewer_id();
if ($calendar !== null) {
  $time = round(microtime(true) * 1000); // in milliseconds
  $conn->query(
    "INSERT INTO roles(calendar, user, ".
      "creation_time, last_view, role, subscribed) ".
      "VALUES ($calendar, $viewer_id, $time, $time, ".
      ROLE_VIEWED.", 0) ON DUPLICATE KEY UPDATE ".
      "creation_time = LEAST(VALUES(creation_time), creation_time), ".
      "last_view = GREATEST(VALUES(last_view), last_view), ".
      "role = GREATEST(VALUES(role), role)"
  );
}

// Get the username
$username = null;
$email = null;
$email_verified = null;
if (user_logged_in()) {
  $result = $conn->query(
    "SELECT username, email, email_verified FROM users WHERE id = $viewer_id"
  );
  $user_row = $result->fetch_assoc();
  $username = $user_row['username'];
  $email = $user_row['email'];
  $email_verified = $user_row['email_verified'];
}

// Fetch the actual text for each day
$entries = array();
if ($home) {
  $result = $conn->query(
    "SELECT e.id AS entry_id, DAY(d.date) AS day, e.text, e.creation_time, ".
      "d.calendar, e.deleted, u.username AS creator FROM entries e ".
      "LEFT JOIN days d ON d.id = e.day ".
      "LEFT JOIN roles r ON r.calendar = d.calendar AND r.user = $viewer_id ".
      "LEFT JOIN users u ON u.id = e.creator ".
      "WHERE MONTH(d.date) = $month AND YEAR(d.date) = $year AND ".
      "r.subscribed = 1 AND e.deleted = 0 ORDER BY d.date, e.creation_time"
  );
} else {
  $result = $conn->query(
    "SELECT e.id AS entry_id, DAY(d.date) AS day, e.text, e.creation_time, ".
      "d.calendar, e.deleted, u.username AS creator FROM entries e ".
      "LEFT JOIN days d ON d.id = e.day ".
      "LEFT JOIN users u ON u.id = e.creator ".
      "WHERE MONTH(d.date) = $month AND YEAR(d.date) = $year AND ".
      "d.calendar = $calendar AND e.deleted = 0 ORDER BY d.date, e.creation_time"
  );
}
while ($row = $result->fetch_assoc()) {
  $entry_calendar = intval($row['calendar']);
  if (!$calendar_infos[$entry_calendar]['authorized']) {
    continue;
  }
  $day = intval($row['day']);
  $entry = intval($row['entry_id']);
  $entries[$entry] = array(
    "id" => (string)$entry,
    "calendarID" => (string)$entry_calendar,
    "text" => $row['text'],
    "year" => $year,
    "month" => $month,
    "day" => $day,
    "creationTime" => intval($row['creation_time']),
    "deleted" => (bool)$row['deleted'],
    "creator" => $row['creator'] ?: null,
  );
}

$fonts_css_url = DEV
  ? "fonts/local-fonts.css"
  : "https://fonts.googleapis.com/css?family=Open+Sans:300,600%7CAnaheim";

echo <<<HTML
<!DOCTYPE html>
<html lang="en" class="no-js">
  <head>
    <meta charset="utf-8" />
    <title>SquadCal</title>
    <base href="{$base_url}" />
    <link rel="stylesheet" type="text/css" href="{$fonts_css_url}" />
    <link rel="stylesheet" type="text/css" href="basic.css" />

HTML;
if (!DEV) {
  echo <<<HTML
    <link rel="stylesheet" type="text/css" href="dist/prod.build.css" />

HTML;
}
?>
    <script>
      var username = "<?=$username?>";
      var email = "<?=$email?>";
      var email_verified = <?=($email_verified ? "true" : "false")?>;
      var calendar_infos = <?=json_encode($calendar_infos, JSON_FORCE_OBJECT)?>;
      var entry_infos = <?=json_encode($entries)?>;
      var month = <?=$month?>;
      var year = <?=$year?>;
      var base_url = "<?=$base_url?>";
      var verify_code = <?=$verify_code !== null ? "'$verify_code'" : "null"?>;
      var verify_field = <?=$verify_field !== null ? $verify_field : 'null'?>;
      var reset_password_username = "<?=$reset_password_username?>";
      var home = <?=$home ? 'true' : 'false'?>;
      var calendar_id = <?=$calendar ? "'$calendar'" : "null"?>;
    </script>
  </head>
  <body>
<?php

echo <<<HTML
    <div id="react-root">
      <header>
        <h1>SquadCal</h1>
        <div class="upper-right">
          <img
            class="page-loading"
            src="images/ajax-loader.gif"
            alt="loading"
          />
        </div>
        <div class="lower-left">
          <div class="account-button">

HTML;
if (user_logged_in()) {
  echo <<<HTML
            <span>logged in as $username</span>

HTML;
} else {
  echo <<<HTML
            <span>Log in · Register</span>

HTML;
}

$month_name = $month_beginning_timestamp->format('F');

echo <<<HTML
          </div>
        </div>
        <h2 class="upper-center">
          $month_name $year
        </h2>
      </header>

HTML;
if ($null_state) {
  echo <<<HTML
      <div class="modal-overlay"></div>

HTML;
}
echo <<<HTML
    </div>

HTML;
if (DEV) {
  echo <<<HTML
    <script src="dist/dev.build.js"></script>

HTML;
} else {
  echo <<<HTML
    <script src="dist/prod.build.js"></script>

HTML;
}
?>
  </body>
</html>
