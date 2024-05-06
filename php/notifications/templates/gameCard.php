<?php

function gameCard($gameName, $gameId, $playerNames, $highlight = true) {
    $titleLine = '
        <div><span>
                <b>' . ($gameName !== "" ? $gameName : '#' . strval($gameId)) . '</b>
            </span>' . ($gameName ? '<br><span class="finePrint" style="font-size:small;color:#00000066;">#' . strval($gameId) . '</span>' : '') . '
        </div>
    ';

    $playerList = '<div>';
    for ($i = 0; $i < count($playerNames); $i++) {
        if ($i !== 0) $code .= '<br>';
        $code .= '<span>' . $playerNames[$i] . '</span>';
    }
    $playerList .= '</div>';

    $playLink = 'https://scrabble.colebot.com?game=' . $gameId;
    $playButton = '<a href="' . $playLink . '" style="height:auto;width:100%;background-color:' . ($highlight ? '#FF57BB' : 'transparent;border:1px solid black') . ';color:black;text-decoration:none;padding:5px;border-radius:5px;display:inline-block;box-sizing:border-box;">' . ($highlight ? 'Play' : 'View') . '</a>';

    $card = '<div style="min-width:150px;background-color:#6BBAEC;border-radius:10px;padding:10px;text-align:center;display:inline-block;' . ($highlight ? 'border:3px solid #FF57BB;' : '') . '">'
        . $titleLine
        . '<br>'
        . $playerList
        . '<br>'
        . $playButton
    . '</div>';

    return $card;
}