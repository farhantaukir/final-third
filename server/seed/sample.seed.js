import '../env.bootstrap.js';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import League from '../models/league.model.js';
import Club from '../models/club.model.js';
import Match from '../models/match.model.js';
import PlayerStat from '../models/playerStat.model.js';
import Announcement from '../models/announcement.model.js';
import Feedback from '../models/feedback.model.js';

const DEFAULT_PASSWORD = process.env.SEED_PASSWORD || 'Password123!';

const LEAGUES = [
  {
    name: 'Premier League',
    clubs: [
      {
        name: 'Manchester City', city: 'Manchester', venue: 'Etihad Stadium', founded: 1880, coach: 'Pep Guardiola', players: [
          { name: 'Ederson', position: 'Goalkeeper' }, { name: 'Stefan Ortega', position: 'Goalkeeper' }, { name: 'Kyle Walker', position: 'Defender' }, { name: 'Ruben Dias', position: 'Defender' },
          { name: 'John Stones', position: 'Defender' }, { name: 'Nathan Ake', position: 'Defender' }, { name: 'Manuel Akanji', position: 'Defender' }, { name: 'Rodri', position: 'Midfielder' },
          { name: 'Kevin De Bruyne', position: 'Midfielder' }, { name: 'Bernardo Silva', position: 'Midfielder' }, { name: 'Phil Foden', position: 'Midfielder' }, { name: 'Mateo Kovacic', position: 'Midfielder' },
          { name: 'Erling Haaland', position: 'Forward' }, { name: 'Julian Alvarez', position: 'Forward' }, { name: 'Jack Grealish', position: 'Forward' }, { name: 'Jeremy Doku', position: 'Forward' },
        ],
      },
      {
        name: 'Arsenal', city: 'London', venue: 'Emirates Stadium', founded: 1886, coach: 'Mikel Arteta', players: [
          { name: 'David Raya', position: 'Goalkeeper' }, { name: 'Aaron Ramsdale', position: 'Goalkeeper' }, { name: 'Ben White', position: 'Defender' }, { name: 'William Saliba', position: 'Defender' },
          { name: 'Gabriel Magalhaes', position: 'Defender' }, { name: 'Takehiro Tomiyasu', position: 'Defender' }, { name: 'Oleksandr Zinchenko', position: 'Defender' }, { name: 'Declan Rice', position: 'Midfielder' },
          { name: 'Martin Odegaard', position: 'Midfielder' }, { name: 'Thomas Partey', position: 'Midfielder' }, { name: 'Jorginho', position: 'Midfielder' }, { name: 'Kai Havertz', position: 'Midfielder' },
          { name: 'Bukayo Saka', position: 'Forward' }, { name: 'Gabriel Martinelli', position: 'Forward' }, { name: 'Leandro Trossard', position: 'Forward' }, { name: 'Gabriel Jesus', position: 'Forward' },
        ],
      },
      {
        name: 'Liverpool', city: 'Liverpool', venue: 'Anfield', founded: 1892, coach: 'Arne Slot', players: [
          { name: 'Alisson Becker', position: 'Goalkeeper' }, { name: 'Caoimhin Kelleher', position: 'Goalkeeper' }, { name: 'Trent Alexander-Arnold', position: 'Defender' }, { name: 'Virgil van Dijk', position: 'Defender' },
          { name: 'Ibrahima Konate', position: 'Defender' }, { name: 'Andrew Robertson', position: 'Defender' }, { name: 'Joe Gomez', position: 'Defender' }, { name: 'Alexis Mac Allister', position: 'Midfielder' },
          { name: 'Dominik Szoboszlai', position: 'Midfielder' }, { name: 'Curtis Jones', position: 'Midfielder' }, { name: 'Wataru Endo', position: 'Midfielder' }, { name: 'Ryan Gravenberch', position: 'Midfielder' },
          { name: 'Mohamed Salah', position: 'Forward' }, { name: 'Darwin Nunez', position: 'Forward' }, { name: 'Diogo Jota', position: 'Forward' }, { name: 'Luis Diaz', position: 'Forward' },
        ],
      },
      {
        name: 'Aston Villa', city: 'Birmingham', venue: 'Villa Park', founded: 1874, coach: 'Unai Emery', players: [
          { name: 'Emiliano Martinez', position: 'Goalkeeper' }, { name: 'Robin Olsen', position: 'Goalkeeper' }, { name: 'Ezri Konsa', position: 'Defender' }, { name: 'Pau Torres', position: 'Defender' },
          { name: 'Tyrone Mings', position: 'Defender' }, { name: 'Lucas Digne', position: 'Defender' }, { name: 'Matty Cash', position: 'Defender' }, { name: 'Douglas Luiz', position: 'Midfielder' },
          { name: 'Boubacar Kamara', position: 'Midfielder' }, { name: 'John McGinn', position: 'Midfielder' }, { name: 'Youri Tielemans', position: 'Midfielder' }, { name: 'Jacob Ramsey', position: 'Midfielder' },
          { name: 'Ollie Watkins', position: 'Forward' }, { name: 'Leon Bailey', position: 'Forward' }, { name: 'Moussa Diaby', position: 'Forward' }, { name: 'Jhon Duran', position: 'Forward' },
        ],
      },
      {
        name: 'Tottenham Hotspur', city: 'London', venue: 'Tottenham Hotspur Stadium', founded: 1882, coach: 'Ange Postecoglou', players: [
          { name: 'Guglielmo Vicario', position: 'Goalkeeper' }, { name: 'Fraser Forster', position: 'Goalkeeper' }, { name: 'Cristian Romero', position: 'Defender' }, { name: 'Micky van de Ven', position: 'Defender' },
          { name: 'Pedro Porro', position: 'Defender' }, { name: 'Destiny Udogie', position: 'Defender' }, { name: 'Ben Davies', position: 'Defender' }, { name: 'Yves Bissouma', position: 'Midfielder' },
          { name: 'Pape Matar Sarr', position: 'Midfielder' }, { name: 'Rodrigo Bentancur', position: 'Midfielder' }, { name: 'James Maddison', position: 'Midfielder' }, { name: 'Pierre-Emile Hojbjerg', position: 'Midfielder' },
          { name: 'Heung-Min Son', position: 'Forward' }, { name: 'Richarlison', position: 'Forward' }, { name: 'Dejan Kulusevski', position: 'Forward' }, { name: 'Brennan Johnson', position: 'Forward' },
        ],
      },
      {
        name: 'Chelsea', city: 'London', venue: 'Stamford Bridge', founded: 1905, coach: 'Mauricio Pochettino', players: [
          { name: 'Robert Sanchez', position: 'Goalkeeper' }, { name: 'Djordje Petrovic', position: 'Goalkeeper' }, { name: 'Reece James', position: 'Defender' }, { name: 'Levi Colwill', position: 'Defender' },
          { name: 'Axel Disasi', position: 'Defender' }, { name: 'Thiago Silva', position: 'Defender' }, { name: 'Ben Chilwell', position: 'Defender' }, { name: 'Enzo Fernandez', position: 'Midfielder' },
          { name: 'Moises Caicedo', position: 'Midfielder' }, { name: 'Conor Gallagher', position: 'Midfielder' }, { name: 'Romeo Lavia', position: 'Midfielder' }, { name: 'Cole Palmer', position: 'Midfielder' },
          { name: 'Nicolas Jackson', position: 'Forward' }, { name: 'Christopher Nkunku', position: 'Forward' }, { name: 'Raheem Sterling', position: 'Forward' }, { name: 'Mykhailo Mudryk', position: 'Forward' },
        ],
      },
      {
        name: 'Newcastle United', city: 'Newcastle', venue: "St James' Park", founded: 1892, coach: 'Eddie Howe', players: [
          { name: 'Nick Pope', position: 'Goalkeeper' }, { name: 'Martin Dubravka', position: 'Goalkeeper' }, { name: 'Kieran Trippier', position: 'Defender' }, { name: 'Fabian Schar', position: 'Defender' },
          { name: 'Sven Botman', position: 'Defender' }, { name: 'Dan Burn', position: 'Defender' }, { name: 'Tino Livramento', position: 'Defender' }, { name: 'Bruno Guimaraes', position: 'Midfielder' },
          { name: 'Joelinton', position: 'Midfielder' }, { name: 'Sean Longstaff', position: 'Midfielder' }, { name: 'Sandro Tonali', position: 'Midfielder' }, { name: 'Joe Willock', position: 'Midfielder' },
          { name: 'Alexander Isak', position: 'Forward' }, { name: 'Callum Wilson', position: 'Forward' }, { name: 'Anthony Gordon', position: 'Forward' }, { name: 'Harvey Barnes', position: 'Forward' },
        ],
      },
    ],
  },
  {
    name: 'La Liga',
    clubs: [
      {
        name: 'Real Madrid', city: 'Madrid', venue: 'Santiago Bernabeu', founded: 1902, coach: 'Carlo Ancelotti', players: [
          { name: 'Thibaut Courtois', position: 'Goalkeeper' }, { name: 'Andriy Lunin', position: 'Goalkeeper' }, { name: 'Dani Carvajal', position: 'Defender' }, { name: 'Antonio Rudiger', position: 'Defender' },
          { name: 'David Alaba', position: 'Defender' }, { name: 'Eder Militao', position: 'Defender' }, { name: 'Ferland Mendy', position: 'Defender' }, { name: 'Aurelien Tchouameni', position: 'Midfielder' },
          { name: 'Eduardo Camavinga', position: 'Midfielder' }, { name: 'Federico Valverde', position: 'Midfielder' }, { name: 'Luka Modric', position: 'Midfielder' }, { name: 'Jude Bellingham', position: 'Midfielder' },
          { name: 'Vinicius Junior', position: 'Forward' }, { name: 'Rodrygo', position: 'Forward' }, { name: 'Joselu', position: 'Forward' }, { name: 'Brahim Diaz', position: 'Forward' },
        ],
      },
      {
        name: 'Barcelona', city: 'Barcelona', venue: 'Olympic Stadium', founded: 1899, coach: 'Xavi Hernandez', players: [
          { name: 'Marc-Andre ter Stegen', position: 'Goalkeeper' }, { name: 'Inaki Pena', position: 'Goalkeeper' }, { name: 'Jules Kounde', position: 'Defender' }, { name: 'Ronald Araujo', position: 'Defender' },
          { name: 'Andreas Christensen', position: 'Defender' }, { name: 'Alejandro Balde', position: 'Defender' }, { name: 'Joao Cancelo', position: 'Defender' }, { name: 'Frenkie de Jong', position: 'Midfielder' },
          { name: 'Pedri', position: 'Midfielder' }, { name: 'Gavi', position: 'Midfielder' }, { name: 'Ilkay Gundogan', position: 'Midfielder' }, { name: 'Fermin Lopez', position: 'Midfielder' },
          { name: 'Robert Lewandowski', position: 'Forward' }, { name: 'Raphinha', position: 'Forward' }, { name: 'Joao Felix', position: 'Forward' }, { name: 'Lamine Yamal', position: 'Forward' },
        ],
      },
      {
        name: 'Atletico Madrid', city: 'Madrid', venue: 'Metropolitano Stadium', founded: 1903, coach: 'Diego Simeone', players: [
          { name: 'Jan Oblak', position: 'Goalkeeper' }, { name: 'Ivo Grbic', position: 'Goalkeeper' }, { name: 'Nahuel Molina', position: 'Defender' }, { name: 'Jose Maria Gimenez', position: 'Defender' },
          { name: 'Stefan Savic', position: 'Defender' }, { name: 'Mario Hermoso', position: 'Defender' }, { name: 'Reinildo Mandava', position: 'Defender' }, { name: 'Koke', position: 'Midfielder' },
          { name: 'Rodrigo De Paul', position: 'Midfielder' }, { name: 'Marcos Llorente', position: 'Midfielder' }, { name: 'Saul Niguez', position: 'Midfielder' }, { name: 'Pablo Barrios', position: 'Midfielder' },
          { name: 'Antoine Griezmann', position: 'Forward' }, { name: 'Alvaro Morata', position: 'Forward' }, { name: 'Memphis Depay', position: 'Forward' }, { name: 'Angel Correa', position: 'Forward' },
        ],
      },
      {
        name: 'Girona', city: 'Girona', venue: 'Montilivi', founded: 1930, coach: 'Michel Sanchez', players: [
          { name: 'Paulo Gazzaniga', position: 'Goalkeeper' }, { name: 'Juan Carlos', position: 'Goalkeeper' }, { name: 'Yan Couto', position: 'Defender' }, { name: 'Daley Blind', position: 'Defender' },
          { name: 'Eric Garcia', position: 'Defender' }, { name: 'Miguel Gutierrez', position: 'Defender' }, { name: 'David Lopez', position: 'Defender' }, { name: 'Aleix Garcia', position: 'Midfielder' },
          { name: 'Ivan Martin', position: 'Midfielder' }, { name: 'Yangel Herrera', position: 'Midfielder' }, { name: 'Viktor Tsygankov', position: 'Midfielder' }, { name: 'Portu', position: 'Midfielder' },
          { name: 'Artem Dovbyk', position: 'Forward' }, { name: 'Christian Stuani', position: 'Forward' }, { name: 'Savio', position: 'Forward' }, { name: 'Valery Fernandez', position: 'Forward' },
        ],
      },
      {
        name: 'Athletic Club', city: 'Bilbao', venue: 'San Mames', founded: 1898, coach: 'Ernesto Valverde', players: [
          { name: 'Unai Simon', position: 'Goalkeeper' }, { name: 'Julen Agirrezabala', position: 'Goalkeeper' }, { name: 'Dani Vivian', position: 'Defender' }, { name: 'Yeray Alvarez', position: 'Defender' },
          { name: 'Aitor Paredes', position: 'Defender' }, { name: 'Yuri Berchiche', position: 'Defender' }, { name: 'Oscar de Marcos', position: 'Defender' }, { name: 'Mikel Vesga', position: 'Midfielder' },
          { name: 'Oihan Sancet', position: 'Midfielder' }, { name: 'Inigo Ruiz de Galarreta', position: 'Midfielder' }, { name: 'Ander Herrera', position: 'Midfielder' }, { name: 'Unai Gomez', position: 'Midfielder' },
          { name: 'Nico Williams', position: 'Forward' }, { name: 'Inaki Williams', position: 'Forward' }, { name: 'Gorka Guruzeta', position: 'Forward' }, { name: 'Alex Berenguer', position: 'Forward' },
        ],
      },
      {
        name: 'Real Sociedad', city: 'San Sebastian', venue: 'Reale Arena', founded: 1909, coach: 'Imanol Alguacil', players: [
          { name: 'Alex Remiro', position: 'Goalkeeper' }, { name: 'Unai Marrero', position: 'Goalkeeper' }, { name: 'Robin Le Normand', position: 'Defender' }, { name: 'Igor Zubeldia', position: 'Defender' },
          { name: 'Aihen Munoz', position: 'Defender' }, { name: 'Hamari Traore', position: 'Defender' }, { name: 'Kieran Tierney', position: 'Defender' }, { name: 'Martin Zubimendi', position: 'Midfielder' },
          { name: 'Mikel Merino', position: 'Midfielder' }, { name: 'Brais Mendez', position: 'Midfielder' }, { name: 'Takefusa Kubo', position: 'Midfielder' }, { name: 'Arsen Zakharyan', position: 'Midfielder' },
          { name: 'Mikel Oyarzabal', position: 'Forward' }, { name: 'Umar Sadiq', position: 'Forward' }, { name: 'Ander Barrenetxea', position: 'Forward' }, { name: 'Carlos Fernandez', position: 'Forward' },
        ],
      },
      {
        name: 'Real Betis', city: 'Seville', venue: 'Benito Villamarin', founded: 1907, coach: 'Manuel Pellegrini', players: [
          { name: 'Rui Silva', position: 'Goalkeeper' }, { name: 'Claudio Bravo', position: 'Goalkeeper' }, { name: 'German Pezzella', position: 'Defender' }, { name: 'Marc Bartra', position: 'Defender' },
          { name: 'Abner Vinicius', position: 'Defender' }, { name: 'Hector Bellerin', position: 'Defender' }, { name: 'Aitor Ruibal', position: 'Defender' }, { name: 'Guido Rodriguez', position: 'Midfielder' },
          { name: 'William Carvalho', position: 'Midfielder' }, { name: 'Isco', position: 'Midfielder' }, { name: 'Nabil Fekir', position: 'Midfielder' }, { name: 'Pablo Fornals', position: 'Midfielder' },
          { name: 'Ayoze Perez', position: 'Forward' }, { name: 'Willian Jose', position: 'Forward' }, { name: 'Assane Diao', position: 'Forward' }, { name: 'Juanmi', position: 'Forward' },
        ],
      },
    ],
  },
];

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');

const playerEmail = (clubName, name) => `${slugify(name)}@${slugify(clubName)}.demo.local`;
const coachEmail = (clubName) => `${slugify(clubName)}.coach@demo.local`;

async function clearDemoDataKeepAdmins() {
  const nonAdminIds = await User.find({ role: { $ne: 'admin' } }).select('_id');
  const memberIds = nonAdminIds.map((u) => u._id);

  await Promise.all([
    PlayerStat.deleteMany({}),
    Announcement.deleteMany({}),
    Feedback.deleteMany({}),
    Match.deleteMany({}),
    Club.deleteMany({}),
    League.deleteMany({}),
    memberIds.length ? User.deleteMany({ _id: { $in: memberIds } }) : Promise.resolve(),
  ]);
}

function makeLineup(players) {
  return {
    starters: players.slice(0, 11).map((p) => p._id),
    subs: players.slice(11, 16).map((p) => p._id),
  };
}

function generateStatsRows(players, homeGoals, awayGoals) {
  const rows = players.map((player, idx) => ({
    playerId: player._id,
    goals: 0,
    assists: 0,
    yellowCards: idx % 5 === 0 ? 1 : 0,
    redCards: idx === 14 ? 1 : 0,
  }));
  for (let i = 0; i < homeGoals; i += 1) {
    rows[i % 8].goals += 1;
    rows[(i + 2) % 8].assists += 1;
  }
  for (let i = 0; i < awayGoals; i += 1) {
    const base = 8;
    rows[base + (i % 8)].goals += 1;
    rows[base + ((i + 3) % 8)].assists += 1;
  }
  return rows;
}

async function seedSampleData() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri?.trim() || mongoUri.includes('your_mongodb')) {
    console.error('Set MONGO_URI in server/.env before running the seed script.');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  const summary = {
    leagues: 0,
    clubs: 0,
    coaches: 0,
    players: 0,
    matchesCompleted: 0,
    matchesUpcoming: 0,
    statsRows: 0,
    announcements: 0,
    feedback: 0,
  };

  try {
    await clearDemoDataKeepAdmins();

    const clubMap = new Map();
    const coachMap = new Map();
    const playerMap = new Map();

    for (const leagueSeed of LEAGUES) {
      const league = await League.create({ name: leagueSeed.name });
      summary.leagues += 1;

      for (const clubSeed of leagueSeed.clubs) {
        if (!Array.isArray(clubSeed.players) || clubSeed.players.length !== 16) {
          throw new Error(`Club ${clubSeed.name} must define exactly 16 players`);
        }

        const club = await Club.create({
          name: clubSeed.name,
          homeCity: clubSeed.city,
          homeVenue: clubSeed.venue,
          foundingYear: clubSeed.founded,
          league: league._id,
        });
        summary.clubs += 1;

        const coach = await User.create({
          name: clubSeed.coach,
          email: coachEmail(clubSeed.name),
          password: DEFAULT_PASSWORD,
          role: 'coach',
          club: club._id,
        });
        summary.coaches += 1;
        club.coach = coach._id;
        await club.save();

        const players = [];
        for (let i = 0; i < clubSeed.players.length; i += 1) {
          const seedPlayer = clubSeed.players[i];
          const player = await User.create({
            name: seedPlayer.name,
            email: playerEmail(clubSeed.name, seedPlayer.name),
            password: DEFAULT_PASSWORD,
            role: 'player',
            club: club._id,
            position: seedPlayer.position,
          });
          players.push(player);
          summary.players += 1;
        }

        clubMap.set(clubSeed.name, club);
        coachMap.set(clubSeed.name, coach);
        playerMap.set(clubSeed.name, players);

        const announcement = await Announcement.create({
          club: club._id,
          coach: coach._id,
          message: `Welcome to ${clubSeed.name}. Training intensity goes up this week.`,
        });
        if (announcement) summary.announcements += 1;
      }
    }

    const now = Date.now();
    const matches = [];

    for (const leagueSeed of LEAGUES) {
      const names = leagueSeed.clubs.map((c) => c.name);
      for (let i = 0; i < 6; i += 1) {
        const homeName = names[i];
        const awayName = names[i + 1];
        const homeClub = clubMap.get(homeName);
        const awayClub = clubMap.get(awayName);
        const homePlayers = playerMap.get(homeName);
        const awayPlayers = playerMap.get(awayName);
        const homeLine = makeLineup(homePlayers);
        const awayLine = makeLineup(awayPlayers);

        const homeGoals = (i % 3) + 1;
        const awayGoals = i % 2;

        const completed = await Match.create({
          homeClub: homeClub._id,
          awayClub: awayClub._id,
          date: new Date(now - (14 - i) * 24 * 60 * 60 * 1000),
          venue: homeClub.homeVenue,
          status: 'Completed',
          score: { home: homeGoals, away: awayGoals },
          homeLineup: homeLine.starters,
          awayLineup: awayLine.starters,
          homeSubstitutes: homeLine.subs,
          awaySubstitutes: awayLine.subs,
        });
        matches.push(completed);
        summary.matchesCompleted += 1;

        const statsRows = generateStatsRows(
          [...homePlayers.slice(0, 8), ...awayPlayers.slice(0, 8)],
          homeGoals,
          awayGoals,
        );
        for (const row of statsRows) {
          const sourceClub = homePlayers.some((p) => String(p._id) === String(row.playerId))
            ? homeClub._id
            : awayClub._id;
          await PlayerStat.create({
            match: completed._id,
            player: row.playerId,
            club: sourceClub,
            goals: row.goals,
            assists: row.assists,
            yellowCards: row.yellowCards,
            redCards: row.redCards,
          });
          summary.statsRows += 1;
        }
      }

      for (let i = 0; i < 3; i += 1) {
        const homeName = names[(i + 2) % names.length];
        const awayName = names[(i + 5) % names.length];
        const homeClub = clubMap.get(homeName);
        const awayClub = clubMap.get(awayName);
        const homePlayers = playerMap.get(homeName);
        const awayPlayers = playerMap.get(awayName);
        const homeLine = makeLineup(homePlayers);
        const awayLine = makeLineup(awayPlayers);
        await Match.create({
          homeClub: homeClub._id,
          awayClub: awayClub._id,
          date: new Date(now + (i + 2) * 24 * 60 * 60 * 1000),
          venue: homeClub.homeVenue,
          status: 'Upcoming',
          homeLineup: homeLine.starters,
          awayLineup: awayLine.starters,
          homeSubstitutes: homeLine.subs,
          awaySubstitutes: awayLine.subs,
        });
        summary.matchesUpcoming += 1;
      }
    }

    for (const leagueSeed of LEAGUES) {
      for (const clubSeed of leagueSeed.clubs) {
        const coach = coachMap.get(clubSeed.name);
        const players = playerMap.get(clubSeed.name);
        for (let i = 0; i < 3; i += 1) {
          const target = players[i];
          await Feedback.create({
            coach: coach._id,
            player: target._id,
            club: target.club,
            message: `Review note #${i + 1} for ${target.name}: keep improving positioning.`,
          });
          summary.feedback += 1;
        }
      }
    }

    console.log('Sample data reseeded successfully.');
    console.log(summary);
    console.log(`Default password for all seeded coach/player users: ${DEFAULT_PASSWORD}`);
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

seedSampleData().catch((error) => {
  console.error('Sample seed failed:', error.message);
  process.exit(1);
});
