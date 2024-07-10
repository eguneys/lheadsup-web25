import { For } from 'solid-js/web'
import './Avatar.scss'
import { Bet, Card, Chips, Dests, Raise, ranks, RoundNPov, Stack, StackState, suits } from 'phevaluatorjs25'
import { Accessor, createMemo, createSignal, mapArray, Show, Signal } from 'solid-js'

class RaiseUI {

  get threebet() {
    let bet = this.raise.min_raise * 3
    if (this.raise.match === 0) {
      if (bet <= this.stack) {
        return bet
      }
    }
  }


  get fivebet() {
    let bet = this.raise.min_raise * 5
    if (this.raise.match === 0) {
      if (bet <= this.stack) {
        return bet
      }
    }
  }

  get potraise() {
    let bet = this.pot
    if (bet <= this.stack) {
      return bet
    }
  }

  get min_raise() {
    let bet = this.raise.min_raise
    if (this.raise.match !== 0) {
      if (bet <= this.stack) {
        return bet + this.raise.match
      }
    }
  }

  get third_raise() {
    let bet = this.raise.min_raise * 3
    if (this.raise.match !== 0) {
      if (bet <= this.stack) {
        return bet + this.raise.match
      }
    }
  }


  get five_raise() {
    let bet = this.raise.min_raise * 5
    if (this.raise.match !== 0) {
      if (bet <= this.stack) {
        return bet + this.raise.match
      }
    }
  }

  get allin() {
    return this.stack
  }

  get current() {
    return this._current[0]()
  }

  set current(e: number) {
    this._current[1](e)
  }

  get current_enabled() {
    return !(this.raise.cant_minraise || this.raise.cant_match)
  }

  on_current(v: number) {
    this.current = v
  }

  _current: Signal<Chips>

  constructor(readonly raise: Raise, readonly stack: Chips, readonly pot: Chips) {
    this._current = createSignal(Math.min(stack, raise.min_raise))
  }


}

const card_klass = (card: Card) => {

  const suit_klasses = ['clubs', 'hearts', 'diamonds', 'spades']
  const rank_klasses = ['two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'jack', 'queen', 'king', 'ace']

  let rank = rank_klasses[ranks.indexOf(card[0])]
  let suit = suit_klasses[suits.indexOf(card[1])]

  return `card ${suit} ${rank}`
}

class StackMemo {
    bet: Accessor<Bet | undefined>
    stack: Accessor<number>
    state: Accessor<StackState>
    hand: Accessor<[Card, Card] | undefined>

    constructor(stack: Stack) { 
        this.stack = createMemo(() => stack.stack)
        this.state = createMemo(() => stack.state)
        this.bet = createMemo(() => stack.bet)
        this.hand = createMemo(() => stack.hand)
    }

}

export const Poker2 = () => {

    let dests_fen = 'call-170 raise-170-170 fold'



    let fen = `10-20 1 | f1840 3cQs fold-1160 / p960 raise-280-880-880 $!`
    fen = `60-120 2 | @120 5d2h / i4800 raise-0-0-120 $ 960-12 !TdQcJc5sKs`


    let dests = Dests.from_fen(dests_fen)

    let npov = createMemo(() => RoundNPov.from_fen(fen))
    let stacks = createMemo(mapArray(() => npov().stacks, _ => new StackMemo(_)))
    let flop = createMemo(() => npov().flop)
    let turn = createMemo(() => npov().turn)
    let river = createMemo(() => npov().river)
    let pot = createMemo(() => npov().pot)

    let raise_ui = createMemo(() => {
      let raise = dests.raise
      if (raise) {
        return new RaiseUI(raise, stacks()[0].stack(), pot()?.total_pot ?? 0)
      }
    })

    let klass = ['one', 'two']

    return (<>

        <div class='poker2'>
            <div class='table'>
               <div class='bg'></div>
               <div class='logo'><span>li</span>HeadsUp</div>
               <div class='circle'></div>
               <div class='middle'>
                <Show fallback={
                  <>
                  <div class='flop1'></div>
                  <div class='flop2'></div>
                  <div class='flop3'></div>
                  </>
                  } when={flop()}>{flop => 
                  <>
                  <div class='flop1'><div class={card_klass(flop()[0])}></div></div>
                  <div class='flop2'><div class={card_klass(flop()[1])}></div></div>
                  <div class='flop3'><div class={card_klass(flop()[2])}></div></div>
                  </>
                }</Show>
                <div class='turn'><Show when={turn()}>{turn => <div class={card_klass(turn())}></div>}</Show></div>
                <div class='river'><Show when={river()}>{river => <div class={card_klass(river())}></div>}</Show></div>
               </div>
               <div class='totalpot'>
                <Show when={pot()}>{pot => 
                  <>
                    <span>Total Pot:</span>
                    <span class='chips'>{pot().total_pot}<span>li</span></span>
                  </>
                }</Show>
               </div>


              <Show when={dests}>{ dests =>
                <>
                <div class='bet-ui'>
                <Show when={raise_ui()}>{ raise_ui =>
                  <div class='raise-ui'>
                    <div class='slider-ui'>
                      <input type='range' min={raise_ui().min_raise} max={raise_ui().allin} value={raise_ui().current} class='slider' onChange={(e) => raise_ui().current = parseInt(e.target.value) } onInput={(e) => raise_ui().current = parseInt(e.target.value) }></input>
                      <span class='chips'>{raise_ui().current}<span>li</span></span>
                    </div>
                    <div class='pre-raises'>
                      <Show when={raise_ui().threebet}>{ threebet => 
                        <button onClick={() => raise_ui().on_current(threebet())} class='raise one'>3 Bet</button>
                      }</Show>
                      <Show when={raise_ui().fivebet}>{ fivebet => 
                        <button onClick={() => raise_ui().on_current(fivebet())} class='raise two'>5 Bet</button>
                      }</Show>
                      <Show when={raise_ui().min_raise}>{ min_raise => 
                        <button onClick={() => raise_ui().on_current(min_raise())} class='raise one'>Min Raise</button>
                      }</Show>
                      <Show when={raise_ui().third_raise }>{ third_raise => 
                        <button onClick={() => raise_ui().on_current(third_raise())} class='raise two'>x3 Raise</button>
                      }</Show>
                      <Show when={raise_ui().potraise}>{ pot => 
                        <button onClick={() => raise_ui().on_current(pot())} class='raise three'>Pot</button>
                      }</Show>
                      <Show when={raise_ui().allin}>{ allin => 
                        <button onClick={() => raise_ui().on_current(allin())} class='raise four'>All-in</button>
                      }</Show>
                    </div>
                  </div>
                }</Show>
                  <div class='action-ui'>
                    <Show when={dests().fold}>
                      <button class='fold'>Fold</button>
                    </Show>
                    <Show when={dests().call}>{call => 
                      <button class='call'>Call <span class='chips'>{call().match} <span>li</span></span></button>
                    }</Show>
                    <Show when={raise_ui()}>{ raise_ui => 
                      <button class='raise'>Raise to <span class='chips'>{raise_ui().current} <span>li</span></span></button>
                    }</Show>
                  </div>

                </div>
                </>
               }</Show>
               <For each={stacks()}>{(stack, i) => 
                 <>
                 <div class={'avatar ' + klass[i()] + (stack.state() === '@' ? ' turn' : '')}>
                    <Show when={stack.state() === '@'}>
                      <div class='turn-timer'><div class='bar' style={`width: 50%`}></div></div>
                    </Show>
                    <Show when={stack.bet()}>{bet => 
                    <>
                      <div class={'betdesc ' + klass[i()]}>
                       <Show fallback= {
                         <span class={`desc ${bet().desc}`}>{bet().desc}</span>
                       } when={bet().raise}>{ raise => 
                         <>
                         <span class={`desc ${bet().desc}`}>{bet().desc}</span>
                         <span class='chips raise'>{raise()}<span>li</span></span>
                         </>
                       }</Show>
                      </div>
                   </>
                   }</Show>
                   <span class='chips'>{stack.stack()}<span>li</span></span>
                   <Show fallback={
                     <div class={'hand ' + klass[i()]}>
                     <div class={'card back'}></div>
                     <div class={'card back'}></div>
                     </div>
                    } when={stack.hand()}>{ hand => 
                     <div class={'hand ' + klass[i()]}>
                     <div class={card_klass(hand()[0])}></div>
                     <div class={card_klass(hand()[1])}></div>
                     </div>
                   }</Show>
                </div>
                <Show when={stack.bet()}>{bet => 
                <>
                  <div class={'betprevious ' + klass[i()]}>
                    <Show when={bet().previous + (bet().match?? 0) > 0}>
                     <span class='chips previous'>{bet().previous + (bet().match?? 0) > 0}<span>li</span></span>
                    </Show>
                  </div>
                </>
                }</Show>

                 </>
               }</For>
            </div>
        </div>

    </>)
}