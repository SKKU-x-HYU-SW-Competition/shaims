# 예제 2: Positioning — 파워히트 없이 몸으로만 막기

**목표**: 파워히트(`hit`)를 한 번도 쓰지 않고, **오직 위치잡기**만으로 공을
넘기는 봇. `expectedLandingPointX`를 어떻게 활용하는지, 왜 "공 바로 밑"이 아니라
"공 옆쪽"에 서야 하는지, 언제 점프하고 언제 참아야 하는지를 다룹니다.

## 왜 이렇게 짜는가 (핵심 아이디어)

### 1. 파워히트를 안 써도 공은 넘어갑니다

원작의 물리 엔진은 파워히트가 아니어도 **몸에 공이 닿으면 튕겨냅니다**. 다만
튕겨나가는 방향이 파워히트처럼 조준되지 않고, **공이 내 몸 중심의 어느 쪽에
닿았는가**로 결정됩니다:

- 공이 내 왼쪽에 닿으면 → 공이 왼쪽으로 튐
- 공이 내 오른쪽에 닿으면 → 공이 오른쪽으로 튐

그래서 "공 밑에 정확히 서면" 공이 위로 곧장 튕겨나가 다시 내 코트로 떨어질
확률이 높습니다. **약간 옆으로 비켜 서서** 몸의 "네트쪽 면"으로 공을 받으면
네트 방향으로 튕겨나갑니다.

### 2. 상대 코트에 공이 있을 땐 참기

`expectedLandingPointX`를 무작정 따라다니면, 공이 상대 코트에 있을 때도 네트
바로 앞에 붙어 있게 됩니다. 상대가 공을 받아 넘긴 순간 반응하기엔 그 위치가
너무 앞이라 후속 대응이 어렵습니다.

→ **공이 상대 코트에 예상 낙하 중이면, 낙하지점 대신 내 코트 중앙으로 후퇴**해서
대기합니다. (원작 내장 AI가 하는 것과 같은 방식)

### 3. 점프 조건은 엄격하게

플레이어 서 있을 때 상하 32픽셀 범위 안에 공이 들어오면 이미 몸으로 받힌
걸로 처리됩니다. "공이 좀 위에 있다" 정도로 점프해봤자 착지하는 순간 공이
지나가버립니다. 그래서 점프는 다음 조건을 **전부** 만족할 때만:

- 공의 x좌표가 내 히트박스 안에 있음 (32픽셀 이내)
- 공의 옆속도가 크지 않음 (내가 뛰어올랐을 때도 여전히 위에 있을 것)
- 공이 진짜 높이 있음 (y < 150)
- 공이 내려오는 중 (yVelocity > 0)

## JavaScript

`src/code-here/Positioning_v1.js`:

```js
'use strict';

function decide(s) {
  // ── 물리 상수 (게임판 좌표계) ────────────────────────────────
  // 코트 전체 폭은 432, 그 절반인 216이 네트(NET_X)입니다.
  // 왼쪽 진영: x가 0 ~ 216, 오른쪽 진영: 216 ~ 432.
  var NET_X = 216;               // GROUND_HALF_WIDTH
  var GROUND_WIDTH = 432;

  // 내 캐릭터 히트박스 반지름. 공이 내 x ± 32 안으로 들어오면
  // "몸에 닿았다"고 판정됩니다.
  var PLAYER_HALF_LENGTH = 32;

  // 내가 어느 진영인지에 따라 "네트로 가는 방향"의 부호가 뒤집힙니다.
  //   LEFT 진영이면 오른쪽(+1)이 네트 쪽,
  //   RIGHT 진영이면 왼쪽(-1)이 네트 쪽.
  var towardNet = s.side === 'RIGHT' ? -1 : 1;

  // ── 내 진영 경계 & 대기 위치 ─────────────────────────────────
  // 내 코트의 왼쪽 끝(ownNearBoundary)과 오른쪽 끝(ownFarBoundary).
  // 대기 위치는 그 한가운데 — 상대 쪽에 공이 있을 때 여기서 기다립니다.
  var ownNearBoundary = s.side === 'RIGHT' ? NET_X : 0;
  var ownFarBoundary  = s.side === 'RIGHT' ? GROUND_WIDTH : NET_X;
  var standbyX = (ownNearBoundary + ownFarBoundary) / 2;

  // ── 공이 우리 쪽으로 떨어질지 판단 ──────────────────────────
  // expectedLandingPointX는 물리 엔진이 미리 계산해 준 "공의 예상 낙하지점".
  // 그 값이 내 진영 경계 안이면 우리 쪽으로 떨어질 예정입니다.
  var landingOnOwnSide =
    s.ball.expectedLandingPointX > ownNearBoundary &&
    s.ball.expectedLandingPointX < ownFarBoundary;

  // ── 목표 x 좌표 결정 ────────────────────────────────────────
  var targetX;
  if (landingOnOwnSide) {
    // 공이 진짜 우리 쪽으로 온다.
    // "낙하지점 그대로" 서지 말고 살짝 네트 반대쪽으로 물러서서 서면,
    // 공이 내 몸의 "네트 쪽 면"에 맞아 네트 방향으로 튕겨나갑니다.
    // 몸으로만 넘기는 이 봇의 유일한 공격 수단입니다.
    targetX = s.ball.expectedLandingPointX - towardNet * 12;
  } else {
    // 공이 아직 상대 쪽에 있다.
    // 네트에 붙어 있으면 상대가 넘긴 순간 반응할 여유가 없으므로,
    // 내 코트 중앙까지 물러나 대기합니다.
    targetX = standbyX;
  }

  // ── 걷기 결정 ──────────────────────────────────────────────
  // 목표 x와 현재 위치의 차이가 6픽셀 이상일 때만 그쪽으로 걸어갑니다.
  // 임계값을 두는 이유는 목표 근처에서 왔다갔다 진동하는 걸 막기 위함.
  var dx = targetX - s.self.x;
  var x = 0;
  if (Math.abs(dx) > 6) {
    x = dx > 0 ? 1 : -1;
  }

  // ── 점프 결정 (엄격하게) ────────────────────────────────────
  // "공이 좀 위에 있다" 정도로 뛰면 착지 순간에 공이 지나가 버립니다.
  // 다음 네 조건을 전부 만족할 때만 점프합니다:
  //   1) 공의 x가 내 히트박스 안 (내 x ± 32)
  //   2) 공의 옆속도가 크지 않음 (내가 착지할 때도 여전히 위에 있어야 함)
  //   3) 공이 진짜 높이 있음 (y < 150)
  //   4) 공이 내려오는 중 (yVelocity > 0)
  var y = 0;
  var xAligned = Math.abs(s.ball.x - s.self.x) < PLAYER_HALF_LENGTH;
  var ballSlowSideways = Math.abs(s.ball.xVelocity) < 5;
  var ballClearlyHigh = s.ball.y < 150;
  if (
    s.self.state === 0 &&   // 서 있는 상태여야 (점프·다이빙 중이 아니어야) 점프 가능
    xAligned &&
    ballSlowSideways &&
    ballClearlyHigh &&
    s.ball.yVelocity > 0
  ) {
    y = -1;   // -1 = 위(점프), 0 = 가만히, 1 = 아래(다이빙). 여기선 점프만.
  }

  // hit(파워히트)는 항상 0. 이 봇은 오직 몸으로만 공을 받아 넘깁니다.
  return { x: x, y: y, hit: 0 };
}
```

## Python

`src/code-here/Positioning_v1.py`:

```python
def decide(s):
    # ── 물리 상수 (게임판 좌표계) ───────────────────────────────
    # 코트 전체 폭은 432, 그 절반인 216이 네트.
    # 왼쪽 진영: x가 0 ~ 216, 오른쪽 진영: 216 ~ 432.
    NET_X = 216
    GROUND_WIDTH = 432

    # 내 캐릭터 히트박스 반지름. 공이 내 x ± 32 안이면 "몸에 닿음".
    PLAYER_HALF_LENGTH = 32

    # 어느 진영인지에 따라 "네트로 가는 방향"의 부호가 뒤집힘.
    #   LEFT면 오른쪽(+1)이 네트 쪽, RIGHT면 왼쪽(-1)이 네트 쪽.
    toward_net = -1 if s['side'] == 'RIGHT' else 1

    # ── 내 진영 경계 & 대기 위치 ────────────────────────────────
    # 내 코트의 양끝. 대기 위치는 그 중앙 — 상대 쪽에 공이 있을 때
    # 여기서 기다립니다.
    own_near = NET_X if s['side'] == 'RIGHT' else 0
    own_far  = GROUND_WIDTH if s['side'] == 'RIGHT' else NET_X
    standby_x = (own_near + own_far) / 2

    # ── 공이 우리 쪽으로 떨어질지 판단 ──────────────────────────
    # expectedLandingPointX는 물리 엔진이 미리 계산해 준 예상 낙하지점.
    landing_on_own_side = (
        s['ball']['expectedLandingPointX'] > own_near
        and s['ball']['expectedLandingPointX'] < own_far
    )

    # ── 목표 x 좌표 ────────────────────────────────────────────
    if landing_on_own_side:
        # 우리 쪽으로 온다. 낙하지점보다 살짝 네트 반대쪽에 서서
        # 몸의 "네트 쪽 면"으로 받으면 공이 네트 방향으로 튕겨나감.
        target_x = s['ball']['expectedLandingPointX'] - toward_net * 12
    else:
        # 상대 쪽에 있다. 뒤로 물러나 대기.
        target_x = standby_x

    # ── 걷기 결정 ──────────────────────────────────────────────
    # 목표와 현재 x 차이가 6픽셀 이상이면 그쪽으로 걸음. 임계값은
    # 목표 근처에서 왔다갔다 진동하는 걸 막기 위함.
    dx = target_x - s['self']['x']
    x = 0
    if abs(dx) > 6:
        x = 1 if dx > 0 else -1

    # ── 점프 결정 (엄격하게) ────────────────────────────────────
    # 다음 네 조건 전부 만족할 때만 점프:
    #   1) 공의 x가 내 히트박스 안 (내 x ± 32)
    #   2) 공의 옆속도가 크지 않음 (착지할 때도 여전히 위에 있어야 함)
    #   3) 공이 진짜 높이 있음 (y < 150)
    #   4) 공이 내려오는 중 (yVelocity > 0)
    y = 0
    x_aligned = abs(s['ball']['x'] - s['self']['x']) < PLAYER_HALF_LENGTH
    ball_slow_sideways = abs(s['ball']['xVelocity']) < 5
    ball_clearly_high = s['ball']['y'] < 150
    if (
        s['self']['state'] == 0    # 서 있는 상태여야 점프 가능
        and x_aligned
        and ball_slow_sideways
        and ball_clearly_high
        and s['ball']['yVelocity'] > 0
    ):
        y = -1   # -1 = 위(점프), 0 = 가만히, 1 = 아래(다이빙)

    # hit(파워히트)는 항상 0. 몸으로만 넘기는 봇.
    return {'x': x, 'y': y, 'hit': 0}
```

## 붙여보기

- `Positioning` vs `AI`: 내장 AI 상대로 몇 랠리는 살아남을 겁니다. 다만
  파워히트가 없어서 결국 잘 조준된 스매시엔 밀립니다.
- `Positioning` vs `Minimal`: 완승. 뼈대만 있는 봇은 아예 못 움직이니까요.

## 다음 단계

지금은 공격 수단이 없어서 결정타를 못 냅니다. 다음 예제에서 파워히트를
추가합니다 → [Power Hit (공격형)](power-hit.md).
