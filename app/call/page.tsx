    const { error } = await supabase.from('service_calls').insert({
      equipment_name: equip,
      location: loc,
      priority,
      description,
      photo_url: photoUrl,
      status: 'Waiting',
      language: lang,
      plant_id: plant,
      submitter_name: submitter,
    })

    setLoading(false)
    if (!error) setSubmitted(true)
    else alert('Error: ' + (error.message || JSON.stringify(error)))
