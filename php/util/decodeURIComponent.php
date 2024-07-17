<?php

function decodeURIComponent($str) {
    $str = preg_replace("/%u([0-9a-f]{3,4})/i","&#x\\1;", urldecode($str));
    return html_entity_decode($str, 0, 'UTF-8');
}