import './PokerNeat.scss'


export const PokerNeat = () => {
    return (<>
    <div class='poker-neat'>
        <div class='info'>
            <div><span>Texas Hold'em Poker Headsup Match</span></div>
            <div><span>Blinds:</span> <span>100li/200li</span></div>
            <div><span>Blinds increase after:</span> <span>2 minutes</span></div>
        </div>
        <div class='middle'>
            <h4>Middle Cards</h4>
            <div class='cards'>
              <div class='holder flop flop1'><div class='card back'></div></div>
              <div class='holder flop flop2'><div class='card two diamonds'></div></div>
              <div class='holder flop flop3'></div>
              <div class='holder turn'></div>
              <div class='holder river'></div>
            </div>
        </div>

        <div class='stacks'>
            <h4>Stacks</h4>
            <div class='wrap'>
                <div class='stack one'>
                    <h5>Your Stack</h5>
                    <div class='cards'>
                        <div class='holder hand1'><div class='card back'></div></div>
                        <div class='holder hand2'><div class='card back'></div></div>
                    </div>

                    <span class='chips'>10li</span>
                    <div class='bet'>
                        <span>Small blind</span>
                        <span class='chips'>10li</span>
                    </div>
                    <div class='previous'>

                    </div>
                    <div class='turn'>
                        <span>turn</span>
                    </div>
                </div>
                <div class='stack two'>
                    <h5>Opponent's Stack</h5>
                    <div class='cards'>
                        <div class='holder hand1'><div class='card back'></div></div>
                        <div class='holder hand2'><div class='card back'></div></div>
                    </div>
                    <span class='chips'>10li</span>

                    <div class='bet'>
                        <span>Big blind</span>
                        <span class='chips'>10li</span>
                    </div>
                    <div class='previous'>
                        <span class='chips'>10li</span>
                    </div>
                </div>

            </div>
        </div>
        <div class='pots'>
            <h4>Total Pot</h4>
            <span class='chips'>10li</span>
        </div>
        <div class='ui'>

        </div>
    </div>
    </>)
}