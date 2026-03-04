from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from datetime import datetime, timedelta
from textblob import TextBlob
from collections import Counter
import random

app = Flask(__name__)
CORS(app)

# ─── SAFETY SCORE ───────────────────────────────────────────
def calculate_safety_score(reports, latitude, longitude, radius=0.05):
    if not reports:
        return 85
    nearby = []
    for r in reports:
        try:
            coords = r.get('location', {}).get('coordinates', [])
            if len(coords) == 2:
                dist = ((coords[1] - latitude)**2 + (coords[0] - longitude)**2)**0.5
                if dist <= radius:
                    nearby.append(r)
        except:
            continue
    if not nearby:
        return 85
    weighted_score = 0
    for r in nearby:
        severity = r.get('severity', 1)
        try:
            created = datetime.fromisoformat(r.get('createdAt', '').replace('Z', '+00:00'))
            days_old = (datetime.now().astimezone() - created).days
            time_weight = max(0.2, 1 - (days_old * 0.1))
        except:
            time_weight = 0.5
        weighted_score += severity * time_weight
    count = len(nearby)
    raw = (weighted_score / (count * 5)) * 100
    safety = max(10, 100 - raw)
    return round(safety)

def get_safety_label(score):
    if score >= 80: return 'Very Safe', '#22c55e'
    elif score >= 60: return 'Moderately Safe', '#84cc16'
    elif score >= 40: return 'Use Caution', '#f59e0b'
    elif score >= 20: return 'Unsafe', '#ef4444'
    else: return 'Danger Zone', '#dc2626'

@app.route('/safety-score', methods=['POST'])
def safety_score():
    data = request.json
    latitude = data.get('latitude', 18.5204)
    longitude = data.get('longitude', 73.8567)
    reports = data.get('reports', [])
    score = calculate_safety_score(reports, latitude, longitude)
    label, color = get_safety_label(score)
    return jsonify({ 'score': score, 'label': label, 'color': color })

# ─── NLP REPORT ANALYZER ────────────────────────────────────
CATEGORY_KEYWORDS = {
    'harassment': ['harass', 'tease', 'stalk', 'follow', 'comment', 'eve teas', 'molest', 'touch', 'grope', 'whistle'],
    'assault': ['beat', 'hit', 'attack', 'assault', 'punch', 'slap', 'push', 'rape', 'abuse', 'violence'],
    'theft': ['steal', 'theft', 'rob', 'snatch', 'pickpocket', 'chain snatch', 'bag', 'mobile', 'phone'],
    'unsafe_area': ['unsafe', 'dangerous', 'scary', 'isolated', 'deserted', 'no people', 'alone', 'abandoned'],
    'poor_lighting': ['dark', 'light', 'lamp', 'visibility', 'street light', 'no light', 'unlit', 'black'],
}

FAKE_INDICATORS = ['test', 'testing', 'xyz', 'abc', 'dummy', 'fake', 'random', 'hello', 'hi there', 'nothing']
URGENT_KEYWORDS = ['rape', 'assault', 'attack', 'weapon', 'knife', 'gun', 'blood', 'unconscious', 'help', 'emergency']

def detect_category(text):
    text_lower = text.lower()
    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[category] = score
    if scores:
        return max(scores, key=scores.get)
    return 'other'

def detect_severity(text):
    text_lower = text.lower()
    urgent_count = sum(1 for kw in URGENT_KEYWORDS if kw in text_lower)
    blob = TextBlob(text)
    sentiment = blob.sentiment.polarity
    if urgent_count >= 2 or any(kw in text_lower for kw in ['rape', 'weapon', 'gun', 'knife']):
        return 5
    elif urgent_count == 1 or sentiment < -0.5:
        return 4
    elif sentiment < -0.2:
        return 3
    elif sentiment < 0:
        return 2
    else:
        return 1

def is_fake(text):
    text_lower = text.lower().strip()
    if len(text) < 10:
        return True, 'Description too short'
    if any(indicator in text_lower for indicator in FAKE_INDICATORS):
        return True, 'Suspicious keywords detected'
    if len(set(text_lower.split())) < 3:
        return True, 'Not enough unique words'
    return False, None

def get_priority(severity, is_urgent):
    if severity >= 5 or is_urgent:
        return 'CRITICAL', '#dc2626'
    elif severity >= 4:
        return 'HIGH', '#ef4444'
    elif severity >= 3:
        return 'MEDIUM', '#f59e0b'
    else:
        return 'LOW', '#22c55e'

@app.route('/analyze-report', methods=['POST'])
def analyze_report():
    data = request.json
    description = data.get('description', '')
    category = data.get('category', '')
    if not description:
        return jsonify({'error': 'No description provided'}), 400
    fake, fake_reason = is_fake(description)
    detected_category = detect_category(description)
    final_category = category if category and category != 'other' else detected_category
    severity = detect_severity(description)
    is_urgent = any(kw in description.lower() for kw in URGENT_KEYWORDS)
    priority, priority_color = get_priority(severity, is_urgent)
    blob = TextBlob(description)
    sentiment_score = round(blob.sentiment.polarity, 2)
    if priority == 'CRITICAL':
        recommendation = '🚨 Immediate police response required. Alert nearest station.'
    elif priority == 'HIGH':
        recommendation = '⚠️ NGO volunteer should follow up within 1 hour.'
    elif priority == 'MEDIUM':
        recommendation = '📋 Add to watchlist. Monitor area for 24 hours.'
    else:
        recommendation = '✅ Log report. Schedule routine area check.'
    return jsonify({
        'is_fake': fake, 'fake_reason': fake_reason,
        'detected_category': final_category, 'severity': severity,
        'is_urgent': is_urgent, 'priority': priority,
        'priority_color': priority_color, 'sentiment_score': sentiment_score,
        'recommendation': recommendation, 'word_count': len(description.split()),
    })

# ─── AI DANGER PREDICTION ───────────────────────────────────
def get_time_risk_multiplier():
    hour = datetime.now().hour
    if 22 <= hour or hour <= 5:
        return 2.0, 'Late Night'
    elif 6 <= hour <= 8:
        return 1.2, 'Early Morning'
    elif 18 <= hour <= 21:
        return 1.5, 'Evening'
    else:
        return 0.8, 'Daytime'

def get_day_risk_multiplier():
    day = datetime.now().weekday()
    if day in [4, 5]:
        return 1.4, 'Weekend'
    elif day == 6:
        return 1.2, 'Sunday'
    else:
        return 1.0, 'Weekday'

@app.route('/predict-danger', methods=['POST'])
def predict_danger():
    data = request.json
    reports = data.get('reports', [])

    if not reports:
        return jsonify({ 'predictions': [], 'message': 'No historical data available' })

    # group reports by area
    area_data = {}
    for r in reports:
        address = r.get('address', 'Unknown')
        area = address.split(',')[0].strip() if ',' in address else address
        coords = r.get('location', {}).get('coordinates', [0, 0])
        if area not in area_data:
            area_data[area] = {
                'count': 0, 'total_severity': 0,
                'categories': [], 'coords': coords,
                'recent_count': 0
            }
        area_data[area]['count'] += 1
        area_data[area]['total_severity'] += r.get('severity', 1)
        area_data[area]['categories'].append(r.get('category', 'other'))

        # check if recent (last 7 days)
        try:
            created = datetime.fromisoformat(r.get('createdAt', '').replace('Z', '+00:00'))
            if (datetime.now().astimezone() - created).days <= 7:
                area_data[area]['recent_count'] += 1
        except:
            pass

    time_multiplier, time_label = get_time_risk_multiplier()
    day_multiplier, day_label = get_day_risk_multiplier()

    predictions = []
    for area, d in area_data.items():
        if d['count'] < 1:
            continue

        avg_severity = d['total_severity'] / d['count']
        recency_boost = 1 + (d['recent_count'] * 0.3)
        base_risk = (avg_severity / 5) * 100
        final_risk = min(100, base_risk * time_multiplier * day_multiplier * recency_boost)
        final_risk = round(final_risk)

        most_common_category = Counter(d['categories']).most_common(1)[0][0]

        if final_risk >= 75:
            risk_level = 'CRITICAL'
            color = '#dc2626'
            advice = '🚨 Avoid this area. High crime probability tonight.'
        elif final_risk >= 50:
            risk_level = 'HIGH'
            color = '#ef4444'
            advice = '⚠️ Exercise extreme caution. Travel in groups.'
        elif final_risk >= 30:
            risk_level = 'MEDIUM'
            color = '#f59e0b'
            advice = '👁️ Stay alert. Avoid isolated spots.'
        else:
            risk_level = 'LOW'
            color = '#22c55e'
            advice = '✅ Relatively safe. Stay aware of surroundings.'

        predictions.append({
            'area': area,
            'risk_score': final_risk,
            'risk_level': risk_level,
            'color': color,
            'advice': advice,
            'incident_count': d['count'],
            'recent_incidents': d['recent_count'],
            'most_common_crime': most_common_category.replace('_', ' '),
            'coordinates': d['coords'],
            'time_factor': time_label,
            'day_factor': day_label,
        })

    predictions.sort(key=lambda x: x['risk_score'], reverse=True)

    return jsonify({
        'predictions': predictions[:10],
        'time_context': time_label,
        'day_context': day_label,
        'total_areas_analyzed': len(area_data),
        'generated_at': datetime.now().strftime('%I:%M %p')
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'AI service running 🤖'})

if __name__ == '__main__':
    app.run(port=5001, debug=True)