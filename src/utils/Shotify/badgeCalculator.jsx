// badgeCalculator.js

export const calculateBadges = (stats, teamLeaders) => {
    const badges = [];
    
    // MVP Badge (points + assists * 2)
    const mvpScore = stats.points + (stats.assists * 2);
    if (mvpScore > 0) {
      if (mvpScore >= 30) {
        badges.push({ 
          name: 'MVP', 
          icon: '🏆🏆🏆', 
          level: 'Gold', 
          progress: 100,
          description: `Generated ${stats.points} points and ${stats.assists * 2} potential points from assists`,
          metrics: 'Points + (Assists × 2) ≥ 30'
        });
      } else if (mvpScore >= 20) {
        badges.push({ 
          name: 'MVP', 
          icon: '🏆🏆', 
          level: 'Silver', 
          progress: 75,
          description: `Generated ${stats.points} points and ${stats.assists * 2} potential points from assists`,
          metrics: 'Points + (Assists × 2) ≥ 20'
        });
      } else if (mvpScore >= 10) {
        badges.push({ 
          name: 'MVP', 
          icon: '🏆', 
          level: 'Bronze', 
          progress: 45,
          description: `Generated ${stats.points} points and ${stats.assists * 2} potential points from assists`,
          metrics: 'Points + (Assists × 2) ≥ 10'
        });
      }
    }
    
    // Big Man Badge (rebounds + blocks * 2)
    const bigManScore = stats.rebounds + (stats.blocks * 2);
    if (bigManScore > 0) {
      if (bigManScore >= 15) {
        badges.push({ 
          name: 'Big Man', 
          icon: '💪💪💪', 
          level: 'Gold', 
          progress: 100,
          description: `Dominated the paint with ${stats.rebounds} rebounds and ${stats.blocks} blocks`,
          metrics: 'Rebounds + (Blocks × 2) ≥ 15'
        });
      } else if (bigManScore >= 10) {
        badges.push({ 
          name: 'Big Man', 
          icon: '💪💪', 
          level: 'Silver', 
          progress: 75,
          description: `Dominated the paint with ${stats.rebounds} rebounds and ${stats.blocks} blocks`,
          metrics: 'Rebounds + (Blocks × 2) ≥ 10'
        });
      } else if (bigManScore >= 5) {
        badges.push({ 
          name: 'Big Man', 
          icon: '💪', 
          level: 'Bronze', 
          progress: 45,
          description: `Dominated the paint with ${stats.rebounds} rebounds and ${stats.blocks} blocks`,
          metrics: 'Rebounds + (Blocks × 2) ≥ 5'
        });
      }
    }
    
    // Playmaker Badge (assists vs turnovers)
    if (stats.assists > 0) {
      const assistRatio = stats.assists / (stats.turnovers || 1);
      if (assistRatio >= 3) {
        badges.push({ 
          name: 'Playmaker', 
          icon: '🏀🏀🏀', 
          level: 'Gold', 
          progress: 100,
          description: `${stats.assists}:${stats.turnovers} assist to turnover ratio`,
          metrics: 'Assist:Turnover Ratio ≥ 3:1'
        });
      } else if (assistRatio >= 2) {
        badges.push({ 
          name: 'Playmaker', 
          icon: '🏀🏀🏀', 
          level: 'Silver', 
          progress: 75,
          description: `${stats.assists}:${stats.turnovers} assist to turnover ratio`,
          metrics: 'Assist:Turnover Ratio ≥ 2:1'
        });
      } else if (assistRatio >= 1.5) {
        badges.push({ 
          name: 'Playmaker', 
          icon: '🏀', 
          level: 'Bronze', 
          progress: 45,
          description: `${stats.assists}:${stats.turnovers} assist to turnover ratio`,
          metrics: 'Assist:Turnover Ratio ≥ 1.5:1'
        });
      }
    }
    
    // Lockdown Defender Badge (steals + blocks)
    const defenseScore = (stats.steals * 2) + (stats.blocks * 2);
    if (defenseScore > 0) {
      if (defenseScore >= 10) {
        badges.push({ 
          name: 'Lockdown', 
          icon: '🛡️🛡️🛡️', 
          level: 'Gold', 
          progress: 100,
          description: `Defensive force with ${stats.steals} steals and ${stats.blocks} blocks`,
          metrics: '(Steals × 2) + (Blocks × 2) ≥ 10'
        });
      } else if (defenseScore >= 6) {
        badges.push({ 
          name: 'Lockdown', 
          icon: '🛡️🛡️', 
          level: 'Silver', 
          progress: 75,
          description: `Defensive force with ${stats.steals} steals and ${stats.blocks} blocks`,
          metrics: '(Steals × 2) + (Blocks × 2) ≥ 6'
        });
      } else if (defenseScore >= 4) {
        badges.push({ 
          name: 'Lockdown', 
          icon: '🛡️', 
          level: 'Bronze', 
          progress: 45,
          description: `Defensive force with ${stats.steals} steals and ${stats.blocks} blocks`,
          metrics: '(Steals × 2) + (Blocks × 2) ≥ 4'
        });
      }
    }
    
    // Sharpshooter Badge (FG% and 3PT makes)
    if (stats.fgAttempts >= 5 || stats.threePtMade >= 2) {
      const shootingScore = ((stats.fgPercentage * 0.6) + (stats.threePtMade * 15)) / 2;
      if (shootingScore >= 50) {
        badges.push({ 
          name: 'Sharpshooter', 
          icon: '🎯🎯🎯', 
          level: 'Gold', 
          progress: 100,
          description: `${stats.fgPercentage}% FG with ${stats.threePtMade} three-pointers made`,
          metrics: '(FG% × 0.6 + 3PM × 15) ÷ 2 ≥ 50'
        });
      } else if (shootingScore >= 35) {
        badges.push({ 
          name: 'Sharpshooter', 
          icon: '🎯🎯', 
          level: 'Silver', 
          progress: 75,
          description: `${stats.fgPercentage}% FG with ${stats.threePtMade} three-pointers made`,
          metrics: '(FG% × 0.6 + 3PM × 15) ÷ 2 ≥ 35'
        });
      } else if (shootingScore >= 25) {
        badges.push({ 
          name: 'Sharpshooter', 
          icon: '🎯🎯', 
          level: 'Bronze', 
          progress: 45,
          description: `${stats.fgPercentage}% FG with ${stats.threePtMade} three-pointers made`,
          metrics: '(FG% × 0.6 + 3PM × 15) ÷ 2 ≥ 25'
        });
      }
    }
    
    // Bricks Badge (poor shooting)
    if (stats.fgAttempts >= 5) {
      // Only include FT% in brick score if player has attempted free throws
      const ftPenalty = stats.ftAttempts > 0 ? (100 - stats.ftPercentage) : 0;
      const brickScore = (100 - stats.fgPercentage) + ftPenalty;

      // Adjust thresholds since we're potentially not including FT%
      if (brickScore >= 80 && stats.fgPercentage < 35) {  // Added FG% requirement
        badges.push({ 
          name: 'Bricklayer', 
          icon: '🧱🧱🧱', 
          level: 'Gold', 
          progress: 100,
          description: `Struggled with ${stats.fgPercentage}% FG${stats.ftAttempts > 0 ? ` and ${stats.ftPercentage}% FT` : ''}`,
          metrics: stats.ftAttempts > 0 
            ? '(100 - FG%) + (100 - FT%) ≥ 80 and FG% < 35%'
            : '(100 - FG%) ≥ 65 and FG% < 35%'
        });
      } else if (brickScore >= 65 && stats.fgPercentage < 40) {  // Added FG% requirement
        badges.push({ 
          name: 'Bricklayer', 
          icon: '🧱🧱', 
          level: 'Silver', 
          progress: 75,
          description: `Struggled with ${stats.fgPercentage}% FG${stats.ftAttempts > 0 ? ` and ${stats.ftPercentage}% FT` : ''}`,
          metrics: stats.ftAttempts > 0 
            ? '(100 - FG%) + (100 - FT%) ≥ 65 and FG% < 40%'
            : '(100 - FG%) ≥ 60 and FG% < 40%'
        });
      } else if (brickScore >= 50 && stats.fgPercentage < 45) {  // Added FG% requirement
        badges.push({ 
          name: 'Bricklayer', 
          icon: '🧱', 
          level: 'Bronze', 
          progress: 45,
          description: `Struggled with ${stats.fgPercentage}% FG${stats.ftAttempts > 0 ? ` and ${stats.ftPercentage}% FT` : ''}`,
          metrics: stats.ftAttempts > 0 
            ? '(100 - FG%) + (100 - FT%) ≥ 50 and FG% < 45%'
            : '(100 - FG%) ≥ 55 and FG% < 45%'
        });
      }
    }
    
    // Butterfingers Badge (high turnovers)
    if (stats.turnovers > 0) {
      const turnoverRatio = stats.turnovers / (stats.assists || 1);
      if (turnoverRatio >= 3 && stats.turnovers >= 4) {
        badges.push({ 
          name: 'Butterfingers', 
          icon: '🧈🧈🧈', 
          level: 'Gold', 
          progress: 100,
          description: `${stats.turnovers} turnovers with ${stats.assists} assists`,
          metrics: 'Turnover:Assist Ratio ≥ 3:1 and TO ≥ 4'
        });
      } else if (turnoverRatio >= 2 && stats.turnovers >= 3) {
        badges.push({ 
          name: 'Butterfingers', 
          icon: '🧈🧈', 
          level: 'Silver', 
          progress: 75,
          description: `${stats.turnovers} turnovers with ${stats.assists} assists`,
          metrics: 'Turnover:Assist Ratio ≥ 2:1 and TO ≥ 3'
        });
      } else if (turnoverRatio >= 1.5 && stats.turnovers >= 2) {
        badges.push({ 
          name: 'Butterfingers', 
          icon: '🧈', 
          level: 'Bronze', 
          progress: 45,
          description: `${stats.turnovers} turnovers with ${stats.assists} assists`,
          metrics: 'Turnover:Assist Ratio ≥ 1.5:1 and TO ≥ 2'
        });
      }
    }
    
    return badges;
  };