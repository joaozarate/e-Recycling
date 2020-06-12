import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import api from '../../services/api';
import ibge from '../../services/ibge-api';

import Dropzone from '../../components/Dropzone';

import './style.css';

import logo from '../../assets/logo.svg'

const CreatePoint = () => {

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setInitialPosition([latitude, longitude]);
        })
    });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    });

    interface Item {
        id: number;
        title: string;
        image_url: string;
    }

    const [items, setItems] = useState<Item[]>([]);

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        });
    }, []);

    interface UF {
        id: number;
        acronym: string;
        name: string;
    }

    interface IBGEUFResponse {
        id: number;
        sigla: string;
        nome: string;
    }

    const [uf, setUF] = useState<UF[]>([]);
    const [selectedState, setSelectedState] = useState('0');

    useEffect(() => {
        ibge.get<IBGEUFResponse[]>('estados').then(response => {

            const states = response.data.map((item) => {

                return {
                    id: item.id,
                    acronym: item.sigla,
                    name: item.nome,
                }

            });

            setUF(states.sort((a: UF, b: UF) => {
                if (a.name < b.name) { return -1; }
                if (a.name > b.name) { return 1; }
                return 0;
            }));

        });
    }, []);

    interface City {
        id: number;
        name: string;
    }

    interface IBGECityResponse {
        id: number;
        nome: string;
    }

    const [city, setCity] = useState<City[]>([]);
    const [selectedCity, setSelectedCity] = useState('0');

    useEffect(() => {

        if (selectedState === '0') {
            return;
        }

        ibge.get<IBGECityResponse[]>(`estados/${selectedState}/municipios`).then(response => {

            const cities = response.data.map(item => {
                return {
                    id: item.id,
                    name: item.nome,
                }
            });

            setCity(cities);

        });

    }, [selectedState]);

    function handleSelectState(event: ChangeEvent<HTMLSelectElement>) {
        const state = event.target.value;
        setSelectedState(state);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;
        setSelectedCity(city);
    }

    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng,
        ]);
    }

    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {

        const { name, value } = event.target;

        setFormData({ ...formData, [name]: value });

    }

    const [selectedFile, setSelectedFile] = useState<File>();

    function handleSelectItem(id: number) {

        const alreadySelected = selectedItems.findIndex(item => item === id);

        if (alreadySelected >= 0) {
            const filtredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filtredItems);
        } else {
            setSelectedItems([...selectedItems, id]);
        }

    }

    async function handleSubmit(event : FormEvent) {
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const uf = selectedState;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = new FormData();

            data.append('name', name);
            data.append('email', email);
            data.append('whatsapp', whatsapp);
            data.append('uf', uf);
            data.append('city', city);
            data.append('latitude', String(latitude));
            data.append('longitude', String(longitude));
            data.append('items', items.join(','));

            if (selectedFile) {
                data.append('image', selectedFile);
            }


        await api.post('points', data);

        alert('Drop-off point created!');

        history.push('/');

    }

    return (

        <div id="page-create-point">
            <header>
                <img src={logo} alt="e-Recycling" />

                <Link to="/">
                    <FiArrowLeft /> Back to home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>

                <h1>Register of drop-off point</h1>

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Data</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Place name</label>
                        <input type="text" name="name" id="name" onChange={handleInputChange} />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="text" name="email" id="email" onChange={handleInputChange} />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange} />
                        </div>
                    </div>

                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Location</h2>
                        <span>Select the place on the map</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">State (UF)</label>
                            <select name="uf" id="uf" value={selectedState} onChange={handleSelectState}>
                                <option value="0">Select ...</option>
                                {uf.map(item => (
                                    <option key={item.acronym} value={item.acronym}>{item.name} - {item.acronym}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">City</label>
                            <select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
                                <option value="0">Select ...</option>
                                {city.map(item => (
                                    <option key={item.id} value={item.name}>{item.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Collection items</h2>
                        <span>Select one or more items below</span>
                    </legend>

                    <ul className="items-grid">

                        {items.map(item => (
                            <li
                                key={item.id}
                                onClick={() => handleSelectItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.image_url} alt={item.title} />
                                <span>{item.title}</span>
                            </li>
                        ))}

                    </ul>

                </fieldset>

                <button type="submit">Save</button>

            </form>
        </div>

    );
};

export default CreatePoint;