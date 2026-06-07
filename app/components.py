"""
Components for the AfriLabs AI Streamlit app.
This file contains reusable UI components.
"""

import streamlit as st

def display_sidebar():
    """Display the sidebar with app information."""
    with st.sidebar:
        st.markdown('<h2 class="sidebar-header">About AfriLabs AI</h2>', unsafe_allow_html=True)
        st.markdown('<p class="sidebar-text">AfriLabs AI is a RAG-powered chatbot designed to answer questions about AfriLabs\' programmes, ecosystem reports, member hubs, blog content, and funding opportunities. It uses local embeddings and the Groq API for fast, accurate responses.</p>', unsafe_allow_html=True)

        st.markdown('<h3 class="sidebar-title">How to Use</h3>', unsafe_allow_html=True)
        st.markdown("""
        <div class="sidebar-text">
        1. Ask a question about AfriLabs in the chat box below<br>
        2. The AI will search through AfriLabs' knowledge base<br>
        3. View the answer and sources in the chat<br>
        4. Click on expander to see detailed source information
        </div>
        """, unsafe_allow_html=True)

        st.markdown('<h3 class="sidebar-title">Example Questions</h3>', unsafe_allow_html=True)
        st.markdown("""
        <div class="sidebar-text">
        - What is the AfriLabs Capacity Building Programme (ACBP)?<br>
        - Which innovation hubs are located in East Africa?<br>
        - What are the main findings in the 2024 AfriLabs Impact Report?<br>
        - How can my hub join the AfriLabs network?<br>
        - What initiatives does AfriLabs have for female founders?
        </div>
        """, unsafe_allow_html=True)

        # Clear chat button
        if st.button("Clear Chat History", type="secondary"):
            st.session_state.messages = []
            st.rerun()

def display_source_expander(sources):
    """Display sources in an expander with enhanced styling."""
    if sources:
        with st.expander("View Sources", expanded=False):
            for i, source in enumerate(sources):
                # Add animation delay for each source
                st.markdown(f"""
                <div class="source-item" style="animation-delay: {i * 0.1}s;">
                    <div class="source-title">{source['title']}</div>
                    <div class="source-meta">
                        <span>Type: {source['doc_type']}</span>
                        <span>Country: {source['country']}</span>
                        {f'<span>Region: {source["region"]}</span>' if source.get('region') else ''}
                    </div>
                    {f'<a href="{source["source_url"]}" target="_blank" style="color: #3A8C8A; text-decoration: none; font-weight: 500;">🔗 Source Link</a>' if source['source_url'] else ''}
                    <div class="source-content">{source['page_content']}</div>
                </div>
                """, unsafe_allow_html=True)

                # Add separator except for last item
                if i < len(sources) - 1:
                    st.markdown("<div style='height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 1.5rem 0;'></div>", unsafe_allow_html=True)