import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const C = {
	navy: '#2F4B72',
	navySoft: '#EDF2F8',
	gold: '#C98900',
	goldSoft: '#FFF3CC',
	gray50: '#F9FAFB',
	gray100: '#F3F4F6',
	gray200: '#E5E7EB',
	gray500: '#6B7280',
	gray700: '#374151',
	gray900: '#111827',
	white: '#FFFFFF',
};

const partyColor = {
	NPP: { bg: '#EEF2FF', text: '#3730A3' },
	SJB: { bg: '#ECFDF3', text: '#166534' },
	UNP: { bg: '#FFF7ED', text: '#9A3412' },
	SLPP: { bg: '#FEF2F2', text: '#991B1B' },
	Other: { bg: '#F3F4F6', text: '#374151' },
};

const REAL_POLITICIAN_IMAGE_MAP = {
	'mahinda rajapaksa': 'https://commons.wikimedia.org/wiki/Special:FilePath/Mahinda%20Rajapaksa.jpg',
	'namal rajapaksa': 'https://commons.wikimedia.org/wiki/Special:FilePath/Namal%20Rajapaksa.jpg',
	'chamal rajapaksa': 'https://commons.wikimedia.org/wiki/Special:FilePath/Chamal%20Rajapaksa.jpg',
	'chamal rajapaksha': 'https://commons.wikimedia.org/wiki/Special:FilePath/Chamal%20Rajapaksa.jpg',
	'anura kumara dissanayake': 'https://commons.wikimedia.org/wiki/Special:FilePath/Anura%20Kumara%20Dissanayake.jpg',
	'sajith premadasa': 'https://commons.wikimedia.org/wiki/Special:FilePath/Sajith%20Premadasa.jpg',
	'ranil wickremesinghe': 'https://commons.wikimedia.org/wiki/Special:FilePath/Ranil%20Wickremesinghe.jpg',
};

const normalizeName = (name) => String(name || '').trim().toLowerCase().replace(/\s+/g, ' ');

const fetchWikipediaImage = async (name) => {
	if (!name) return null;

	const candidates = [
		name,
		`${name} (Sri Lankan politician)`,
	];

	for (const title of candidates) {
		try {
			const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
			const response = await axios.get(url, { timeout: 6000 });
			const imageUrl = response?.data?.originalimage?.source || response?.data?.thumbnail?.source;
			if (imageUrl) return imageUrl;
		} catch {
			// Try next candidate title.
		}
	}

	try {
		const searchUrl = `https://en.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(`${name} sri lanka politician`)}&limit=1`;
		const searchRes = await axios.get(searchUrl, { timeout: 6000 });
		const first = searchRes?.data?.pages?.[0];
		if (first?.title) {
			const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(first.title)}`;
			const summaryRes = await axios.get(summaryUrl, { timeout: 6000 });
			const imageUrl = summaryRes?.data?.originalimage?.source || summaryRes?.data?.thumbnail?.source;
			if (imageUrl) return imageUrl;
		}
	} catch {
		// Ignore search fallback errors.
	}

	return null;
};

const Politicians = () => {
	const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

	const [politicians, setPoliticians] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [search, setSearch] = useState('');
	const [imageFallbackLevel, setImageFallbackLevel] = useState({});
	const [activeCardId, setActiveCardId] = useState(null);

	useEffect(() => {
		const fetchPoliticians = async () => {
			try {
				setLoading(true);
				setError('');
				const res = await axios.get(`${API_URL}/api/politicians`);
				const list = Array.isArray(res.data) ? res.data : [];

				const withInternetImages = await Promise.all(
					list.map(async (politician) => {
						if (politician.profileImageUrl) return politician;
						const internetImageUrl = await fetchWikipediaImage(politician.name);
						return { ...politician, internetImageUrl };
					})
				);

				setPoliticians(withInternetImages);
			} catch (e) {
				setError(e.response?.data?.message || 'Failed to load politicians');
			} finally {
				setLoading(false);
			}
		};

		fetchPoliticians();
	}, [API_URL]);

	const filtered = useMemo(() => {
		const deduped = [];
		const seenNames = new Set();
		for (const politician of politicians) {
			const key = normalizeName(politician.name)
				.replace(/rajapaksha/g, 'rajapaksa')
				.replace(/wickremeslinghe/g, 'wickremesinghe')
				.replace(/wickremaasinghe/g, 'wickremesinghe');
			if (seenNames.has(key)) continue;
			seenNames.add(key);
			deduped.push(politician);
		}

		const q = search.trim().toLowerCase();
		if (!q) return deduped;
		return deduped.filter((p) => {
			return [p.name, p.party, p.district, p.position, p.bio]
				.filter(Boolean)
				.some((v) => String(v).toLowerCase().includes(q));
		});
	}, [politicians, search]);

	const getInitials = (name) => {
		if (!name) return 'NA';
		const parts = name.trim().split(' ').filter(Boolean);
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
	};

	const getImageSources = (politician) => {
		const sources = [];
		if (politician.profileImageUrl && !politician.profileImageUrl.includes('example.com')) sources.push(politician.profileImageUrl);
		const mappedImage = REAL_POLITICIAN_IMAGE_MAP[normalizeName(politician.name)];
		if (mappedImage) sources.push(mappedImage);
		if (politician.internetImageUrl) sources.push(politician.internetImageUrl);
		return sources;
	};

	const handleImageError = (id) => {
		setImageFallbackLevel((prev) => ({
			...prev,
			[id]: (prev[id] || 0) + 1,
		}));
	};

	return (
		<div
			className="min-h-screen px-4 sm:px-6 lg:px-8 py-8"
			style={{ background: `linear-gradient(145deg, ${C.gray50} 0%, #FFFFFF 60%, ${C.navySoft} 100%)` }}
		>
			<div className="max-w-6xl mx-auto space-y-6">
				<div className="rounded-2xl border p-6 sm:p-8" style={{ borderColor: C.gray200, background: C.white }}>
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{ background: C.goldSoft, color: C.gold }}>
						Politician Directory
					</div>
					<h1 className="text-3xl font-extrabold" style={{ color: C.gray900 }}>All Politicians</h1>
					<p className="mt-2" style={{ color: C.gray500 }}>
						Browse all tracked politicians and their details.
					</p>

					<div className="mt-5">
						<input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search by name, party, district or position..."
							className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
							style={{ borderColor: C.gray200, background: C.gray50, color: C.gray900 }}
						/>
					</div>
				</div>

				{loading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="rounded-2xl border p-5 animate-pulse" style={{ borderColor: C.gray200, background: C.white }}>
								<div className="h-36 rounded-xl mb-4" style={{ background: C.gray100 }} />
								<div className="h-5 rounded w-2/3 mb-3" style={{ background: C.gray100 }} />
								<div className="h-4 rounded w-1/2 mb-2" style={{ background: C.gray100 }} />
								<div className="h-4 rounded w-full" style={{ background: C.gray100 }} />
							</div>
						))}
					</div>
				) : error ? (
					<div className="rounded-2xl border p-6" style={{ borderColor: '#FECACA', background: '#FEF2F2' }}>
						<p className="font-semibold" style={{ color: '#991B1B' }}>{error}</p>
					</div>
				) : filtered.length === 0 ? (
					<div className="rounded-2xl border p-8 text-center" style={{ borderColor: C.gray200, background: C.white }}>
						<p className="text-lg font-bold" style={{ color: C.gray900 }}>No politicians found</p>
						<p className="mt-1" style={{ color: C.gray500 }}>Try a different search keyword.</p>
					</div>
				) : (
					<>
						<div className="text-sm" style={{ color: C.gray500 }}>
							Showing <span style={{ color: C.gray900, fontWeight: 700 }}>{filtered.length}</span> politician(s)
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
							{filtered.map((p) => {
								const party = partyColor[p.party] || partyColor.Other;
								const isActive = activeCardId === p._id;
								const sources = getImageSources(p);
								const level = imageFallbackLevel[p._id] || 0;
								const imageSrc = sources[level] || null;
								const showImage = Boolean(imageSrc);
								return (
									<div
										key={p._id}
										className="rounded-2xl border p-4"
										onMouseEnter={() => setActiveCardId(p._id)}
										onMouseLeave={() => setActiveCardId(null)}
										onClick={() => setActiveCardId((prev) => (prev === p._id ? null : p._id))}
										style={{
											borderColor: isActive ? '#BFD3EA' : C.gray200,
											background: C.white,
											boxShadow: isActive ? '0 14px 28px rgba(47,75,114,0.16)' : '0 4px 12px rgba(15,23,42,0.04)',
											transform: isActive ? 'translateY(-3px)' : 'translateY(0)',
											transition: 'all 0.2s ease',
											cursor: 'pointer',
										}}
									>
										<div
											className="rounded-xl mb-4"
											style={{
												height: 'clamp(210px, 24vw, 280px)',
												position: 'relative',
												overflow: 'hidden',
												background: showImage ? '#E8EEF6' : 'linear-gradient(135deg, #2F4B72 0%, #4E6A92 100%)',
											}}
										>
											{showImage ? (
												<img
													src={imageSrc}
													alt={p.name}
													onError={() => handleImageError(p._id)}
													loading="lazy"
													decoding="async"
													referrerPolicy="no-referrer"
													style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center center' }}
												/>
											) : (
												<div
													style={{
														width: '100%',
														height: '100%',
														display: 'flex',
														flexDirection: 'column',
														alignItems: 'center',
														justifyContent: 'center',
														color: '#FFFFFF',
														gap: 8,
													}}
												>
													<div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 1 }}>{getInitials(p.name)}</div>
													<div style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>No verified real image</div>
												</div>
											)}
											<div
												style={{
													position: 'absolute',
													inset: 0,
													background: 'linear-gradient(0deg, rgba(15,23,42,0.18), rgba(15,23,42,0.00) 60%)',
												}}
											/>
											<div style={{ position: 'absolute', left: 12, bottom: 10 }}>
												<span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: party.bg, color: party.text }}>
													{p.party || 'Other'}
												</span>
											</div>
										</div>

										<div className="flex items-start justify-between gap-3">
											<div>
												<h3 className="text-lg font-extrabold" style={{ color: C.gray900 }}>{p.name}</h3>
												<p className="text-sm" style={{ color: C.gray500 }}>{p.position || 'Member of Parliament'}</p>
											</div>
											<span style={{ color: C.gray500, fontSize: 12 }}>#{String(p._id || '').slice(-5)}</span>
										</div>

										<div className="mt-4 space-y-2 text-sm">
											<p><span style={{ color: C.gray500 }}>District:</span> <span style={{ color: C.gray900, fontWeight: 600 }}>{p.district}</span></p>
											{p.bio && <p style={{ color: C.gray700, lineHeight: 1.6 }}>{p.bio}</p>}
										</div>

										<div className="mt-4 flex items-center justify-between">
											<span style={{ fontSize: 12, color: C.gray500 }}>
												{showImage
													? (level === 0 && p.profileImageUrl && !p.profileImageUrl.includes('example.com')
														? 'Profile image available'
														: level <= 1 && p.internetImageUrl
															? 'Using internet image'
															: level <= 1
																? 'Using mapped real image'
																: 'Using internet image')
													: 'No verified real image'}
											</span>
											<span
												style={{
													fontSize: 12,
													fontWeight: 700,
													color: isActive ? C.navy : C.gold,
												}}
											>
												{isActive ? 'Selected' : 'Tap card'}
											</span>
										</div>
									</div>
								);
							})}
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default Politicians;
